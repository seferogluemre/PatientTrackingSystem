"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { toast } from "sonner"
import { ChevronLeft, Save, User, CalendarDays, Stethoscope, Pill, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { getAppointment, editAppointment } from "@/services/appointmentService"
import { generateWithGemini, generateWithGeminiStream } from "@/services/aiService"

const NewExamination = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [appointment, setAppointment] = useState<any>(null)
    const [formData, setFormData] = useState({
        diagnosis: "",
        treatment: "",
        notes: "",
    })
    const [streamingResponse, setStreamingResponse] = useState({
        diagnosis: "",
        treatment: "",
        notes: "",
        isComplete: false
    })

    // Parse appointmentId from query params
    const queryParams = new URLSearchParams(window.location.search)
    const appointmentId = queryParams.get("appointmentId")

    useEffect(() => {
        const fetchAppointmentData = async () => {
            if (!appointmentId) {
                toast.error("Randevu bilgisi bulunamadı")
                navigate("/appointments")
                return
            }

            setLoading(true)
            try {
                const data = await getAppointment(Number(appointmentId))
                console.log("Randevu verileri:", data)

                if (!data) {
                    toast.error("Randevu bulunamadı")
                    navigate("/appointments")
                    return
                }

                setAppointment(data)
            } catch (error: any) {
                console.error("Randevu bilgileri yüklenirken hata:", error)

                if (error.message === 'Randevu bulunamadı') {
                    toast.error("Randevu bulunamadı")
                    navigate("/appointments")
                } else if (error.response?.status === 401) {
                    toast.error("Oturum süreniz dolmuş")
                    navigate("/")
                } else {
                    toast.error("Randevu bilgileri yüklenemedi")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchAppointmentData()
    }, [appointmentId, navigate])

    const handleFormChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        if (!appointmentId) return

        if (!formData.diagnosis.trim() || !formData.treatment.trim()) {
            toast.error("Lütfen teşhis ve tedavi bilgilerini doldurun")
            return
        }

        setSubmitting(true)
        try {
            const examinationData = {
                appointment_id: Number(appointmentId),
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                notes: formData.notes || undefined,
            }

            console.log("Muayene kaydı oluşturuluyor:", examinationData)

            // API isteği
            const response = await fetch("http://localhost:3000/api/examinations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(examinationData),
            })

            if (!response.ok) {
                throw new Error("Muayene kaydı oluşturulamadı")
            }

            const result = await response.json()
            await editAppointment(Number(appointmentId), { status: "completed" })

            toast.success("Muayene kaydı başarıyla oluşturuldu")
            navigate(`/examinations/${result.data.id}`)
        } catch (error) {
            console.error("Muayene kaydı oluşturulurken hata:", error)
            toast.error("Muayene kaydı oluşturulamadı")
        } finally {
            setSubmitting(false)
        }
    }

    const handleGenerateAI = async () => {
        if (!appointment) return;

        setGenerating(true);
        setStreamingResponse({
            diagnosis: "",
            treatment: "",
            notes: "",
            isComplete: false
        });

        try {
            const patientInfo = `
                Hasta Adı: ${appointment.patient?.first_name} ${appointment.patient?.last_name}
                Şikayet: ${appointment.description || "Belirtilmemiş"}
            `;

            const prompt = `Sen bir doktorsun. Aşağıdaki hasta bilgilerine göre olası bir teşhis ve tedavi planı oluştur. Çok uzun olmasın 3-4 satırlı cevaplar yeterlidir. 
            Cevabını şu formatta ver:
            
            Teşhis: [detaylı teşhis]
            
            Tedavi: [detaylı tedavi planı]
            
            Not: [varsa ek öneriler]
            
            Hasta Bilgileri:
            ${patientInfo}`;

            // Stream cevabı yerine her parçasını alarak işleme
            await generateWithGeminiStream(
                prompt,
                (chunk) => {
                    setStreamingResponse(prev => {
                        const updatedDiagnosis = prev.diagnosis + chunk;

                        const diagnosisMatch = updatedDiagnosis.match(/Teşhis:(.*?)(?=Tedavi:|$)/s);
                        const treatmentMatch = updatedDiagnosis.match(/Tedavi:(.*?)(?=Not:|$)/s);
                        const notesMatch = updatedDiagnosis.match(/Not:(.*?)$/s);

                        return {
                            diagnosis: diagnosisMatch?.[1]?.trim() || "",
                            treatment: treatmentMatch?.[1]?.trim() || "",
                            notes: notesMatch?.[1]?.trim() || "",
                            isComplete: false
                        };
                    });
                },
                (fullResponse) => {
                    // Cevap tamamlandığında son bir kez bölümleri ayır
                    const diagnosisMatch = fullResponse.match(/Teşhis:(.*?)(?=Tedavi:|$)/s);
                    const treatmentMatch = fullResponse.match(/Tedavi:(.*?)(?=Not:|$)/s);
                    const notesMatch = fullResponse.match(/Not:(.*?)$/s);

                    const newFormData = {
                        diagnosis: diagnosisMatch?.[1]?.trim() || "",
                        treatment: treatmentMatch?.[1]?.trim() || "",
                        notes: notesMatch?.[1]?.trim() || ""
                    };

                    setFormData(newFormData);
                    setStreamingResponse({
                        ...newFormData,
                        isComplete: true
                    });
                    toast.success("AI ile teşhis ve tedavi önerisi oluşturuldu");
                }
            );
        } catch (error) {
            console.error("AI içerik oluşturma hatası:", error);
            toast.error("AI içerik oluşturulamadı");
            setStreamingResponse(prev => ({ ...prev, isComplete: true }));
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-lg">Randevu bilgileri yükleniyor...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Geri
                    </Button>
                    <h1 className="text-2xl font-bold">Yeni Muayene Kaydı</h1>
                </div>
                <div className="flex space-x-3">
                    <Button
                        onClick={handleGenerateAI}
                        disabled={generating || !appointment}
                        variant="outline"
                        className="flex items-center"
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {generating ? "AI Yanıt Üretiliyor..." : "AI ile Öner"}
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Randevu Bilgileri</CardTitle>
                        <CardDescription>Muayene edilecek randevu detayları</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {appointment && (
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500">Hasta Bilgileri</h3>
                                        <div className="flex items-center mt-2">
                                            <User className="h-5 w-5 text-slate-400 mr-2" />
                                            <p className="font-medium">
                                                {appointment.patient?.first_name} {appointment.patient?.last_name}
                                            </p>
                                        </div>
                                        {appointment.patient?.email && (
                                            <p className="text-sm text-slate-500 mt-1 ml-7">{appointment.patient.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500">Randevu Tarihi</h3>
                                        <div className="flex items-center mt-2">
                                            <CalendarDays className="h-5 w-5 text-slate-400 mr-2" />
                                            <p className="font-medium">
                                                {format(new Date(appointment.appointment_date), "dd MMMM yyyy, EEEE", { locale: tr })}
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1 ml-7">
                                            {format(new Date(appointment.appointment_date), "HH:mm")}
                                        </p>
                                    </div>

                                    {appointment.description && (
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-500">Şikayet</h3>
                                            <div className="flex items-start mt-2">
                                                <AlertCircle className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                                                <p className="text-slate-700">{appointment.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Sağ kolon - Muayene formu */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Muayene Bilgileri</CardTitle>
                        <CardDescription>Teşhis ve tedavi bilgilerini girin</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Stethoscope className="h-5 w-5 text-slate-700 mr-2" />
                                <label className="text-sm font-medium">Teşhis</label>
                            </div>
                            <Textarea
                                name="diagnosis"
                                placeholder={generating ? "AI yanıtı yükleniyor..." : "Hastanın teşhisini giriniz"}
                                value={formData.diagnosis}
                                onChange={handleFormChange}
                                className={`min-h-[100px] ${generating ? "bg-slate-50" : ""}`}
                                disabled={generating}
                            />
                            {generating && streamingResponse.diagnosis && (
                                <div className="text-sm mt-1 text-slate-600">
                                    <p>Oluşturuluyor: {streamingResponse.diagnosis}</p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Pill className="h-5 w-5 text-slate-700 mr-2" />
                                <label className="text-sm font-medium">Tedavi</label>
                            </div>
                            <Textarea
                                name="treatment"
                                placeholder={generating ? "AI yanıtı yükleniyor..." : "Önerilen tedaviyi giriniz (ilaçlar, dozaj, kullanım süresi vb.)"}
                                value={formData.treatment}
                                onChange={handleFormChange}
                                className={`min-h-[150px] ${generating ? "bg-slate-50" : ""}`}
                                disabled={generating}
                            />
                            {generating && streamingResponse.treatment && (
                                <div className="text-sm mt-1 text-slate-600">
                                    <p>Oluşturuluyor: {streamingResponse.treatment}</p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notlar (İsteğe bağlı)</label>
                            <Textarea
                                name="notes"
                                placeholder={generating ? "AI yanıtı yükleniyor..." : "Ek notlar veya öneriler"}
                                value={formData.notes}
                                onChange={handleFormChange}
                                className={`min-h-[100px] ${generating ? "bg-slate-50" : ""}`}
                                disabled={generating}
                            />
                            {generating && streamingResponse.notes && (
                                <div className="text-sm mt-1 text-slate-600">
                                    <p>Oluşturuluyor: {streamingResponse.notes}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default NewExamination;