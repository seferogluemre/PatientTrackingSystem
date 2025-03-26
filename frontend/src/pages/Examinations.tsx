"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { FileText, FilePlus, Search, CalendarDays, ChevronLeft, Edit, Stethoscope, Pill, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { type Examination, User } from "@/types"
import { getExamination, addExamination, updateExamination, getDoctorExaminations } from "@/services/examinationService"
import { getAppointment } from "@/services/appointmentService"
import { ExaminationCard } from "@/components/ui-custom/appointment"

const Examinations = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { id } = useParams()
  const [examination, setExamination] = useState<Examination | null>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [examinations, setExaminations] = useState<any[]>([])
  const [recentExaminations, setRecentExaminations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    appointmentId: 0,
    diagnosis: "",
    treatment: "",
  })

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("clinicUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    if (id) {
      fetchExaminationDetails(Number(id))
    } else {
      fetchDoctorExaminations()
    }
  }, [id])

  const fetchDoctorExaminations = async () => {
    setLoading(true)
    try {
      const storedUser = localStorage.getItem("clinicUser")
      if (!storedUser) return

      const userData = JSON.parse(storedUser)

      // Check if we have a doctor id
      if (userData.id) {
        const data = await getDoctorExaminations(userData.id)
        setExaminations(data)
        setRecentExaminations(data.slice(0, 6)) // Get the most recent 6
      }
    } catch (error) {
      console.error("Failed to fetch examinations:", error)
      toast({
        title: "Hata",
        description: "Muayene listesi yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchExaminationDetails = async (examinationId: number) => {
    setLoading(true)
    try {
      const data = await getExamination(examinationId)
      setExamination(data)

      if (data && data.appointment_id) {
        const appointmentData = await getAppointment(data.appointment_id)
        setAppointment(appointmentData)
      }
    } catch (error) {
      console.error("Failed to fetch examination details:", error)
      toast({
        title: "Hata",
        description: "Muayene bilgileri yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddExamination = async () => {
    try {

      const newExamination = {
        appointment_id: formData.appointmentId,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
      }

      console.log("Adding examination with data:", newExamination)

      await addExamination(newExamination)
      toast({
        title: "Başarılı",
        description: "Muayene kaydı başarıyla eklendi",
      })
      setIsAddDialogOpen(false)
      // Reset form
      setFormData({
        appointmentId: 0,
        diagnosis: "",
        treatment: "",
      })
      fetchDoctorExaminations()
    } catch (error) {
      console.error("Failed to add examination:", error)
      toast({
        title: "Hata",
        description: "Muayene kaydı eklenemedi",
        variant: "destructive",
      })
    }
  }

  const handleUpdateExamination = async () => {
    if (!examination) return

    try {
      const updateData = {
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
      }

      console.log("Updating examination with data:", updateData)

      await updateExamination(examination.id, updateData)
      toast({
        title: "Başarılı",
        description: "Muayene kaydı başarıyla güncellendi",
      })
      setIsEditDialogOpen(false)
      // Refresh examination details
      if (id) fetchExaminationDetails(Number(id))
    } catch (error) {
      console.error("Failed to update examination:", error)
      toast({
        title: "Hata",
        description: "Muayene kaydı güncellenemedi",
        variant: "destructive",
      })
    }
  }

  // Filter examinations based on search term
  const filteredExaminations = examinations.filter((exam) => {
    const patientName = `${exam.appointment?.patient?.first_name} ${exam.appointment?.patient?.last_name}`.toLowerCase()
    return (
      patientName.includes(searchTerm.toLowerCase()) ||
      exam.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.treatment.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // If user is a patient, redirect if not their examination
  const userIsPatient = user?.role === "patient"

  // Render examination details if ID exists
  if (id) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-lg">Muayene bilgileri yükleniyor...</div>
        </div>
      )
    }

    if (!examination) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FileText className="h-16 w-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Muayene Bulunamadı</h2>
          <p className="text-slate-500 mb-4">İstediğiniz muayene kaydına erişilemiyor.</p>
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
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
            <h1 className="text-2xl font-bold">Muayene Detayları</h1>
          </div>

          {(user?.role === "doctor" || user?.role === "secretary") && (
            <Button
              onClick={() => {
                setFormData({
                  appointmentId: examination.appointment_id,
                  diagnosis: examination.diagnosis,
                  treatment: examination.treatment,
                })
                setIsEditDialogOpen(true)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Muayene Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {appointment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Hasta Bilgileri</h3>
                    <div className="flex items-center mt-2">
                      <User className="h-5 w-5 text-slate-400 mr-2" />
                      <p className="font-medium">
                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Doktor</h3>
                    <div className="flex items-center mt-2">
                      <User className="h-5 w-5 text-slate-400 mr-2" />
                      <p className="font-medium">
                        Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 ml-7">{appointment.doctor?.specialty}</p>
                  </div>
                </div>

                <div className="space-y-4">
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
                      <p className="mt-1 text-slate-700">{appointment.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <div className="flex items-center">
                  <Stethoscope className="h-5 w-5 text-slate-700 mr-2" />
                  <h3 className="text-lg font-medium">Teşhis</h3>
                </div>
                <p className="mt-2 p-4 bg-slate-50 rounded-lg">{examination.diagnosis}</p>
              </div>

              <div>
                <div className="flex items-center">
                  <Pill className="h-5 w-5 text-slate-700 mr-2" />
                  <h3 className="text-lg font-medium">Tedavi</h3>
                </div>
                <p className="mt-2 p-4 bg-slate-50 rounded-lg whitespace-pre-line">{examination.treatment}</p>
              </div>

              {examination.notes && (
                <div>
                  <h3 className="text-lg font-medium">Notlar</h3>
                  <p className="mt-2 p-4 bg-slate-50 rounded-lg whitespace-pre-line">{examination.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main examinations listing page (only for doctors and secretaries)
  if (userIsPatient) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Muayene Kayıtlarım</h1>
        <p>Muayene kayıtlarınızı görmek için lütfen randevu geçmişinize bakınız.</p>
        <Button className="mt-4" onClick={() => navigate("/appointments")}>
          Randevularımı Görüntüle
        </Button>
      </div>
    )
  }

  // For doctors and secretaries - ability to create new examinations
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Muayene Kayıtları</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <FilePlus className="mr-2 h-4 w-4" />
          Yeni Muayene Ekle
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-slate-400" />
        <Input
          placeholder="Hasta adı veya teşhis ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tüm Kayıtlar</TabsTrigger>
          <TabsTrigger value="recent">Son Eklenenler</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="animate-pulse text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Muayene kayıtları yükleniyor...
              </div>
            </div>
          ) : filteredExaminations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExaminations.map((examination) => (
                <ExaminationCard key={examination.id} examination={examination} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-lg font-medium">Muayene kaydı bulunamadı</h3>
              <p className="text-sm text-slate-500 mt-1">
                {searchTerm
                  ? "Arama kriterlerinize uygun muayene kaydı bulunamadı."
                  : "Henüz kayıtlı muayene bulunmuyor."}
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="recent" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="animate-pulse text-lg">Yükleniyor...</div>
            </div>
          ) : recentExaminations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentExaminations.map((examination) => (
                <ExaminationCard key={examination.id} examination={examination} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-500">Henüz kayıt bulunmuyor.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Examination Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Muayene Ekle</DialogTitle>
            <DialogDescription>Randevu için muayene bilgilerini doldurun</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Randevu ID</label>
              <Input
                name="appointmentId"
                type="number"
                placeholder="Randevu ID giriniz"
                value={formData.appointmentId}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teşhis</label>
              <Textarea
                name="diagnosis"
                placeholder="Hastanın teşhisini giriniz"
                value={formData.diagnosis}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tedavi</label>
              <Textarea
                name="treatment"
                placeholder="Önerilen tedaviyi giriniz"
                value={formData.treatment}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddExamination}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Examination Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Muayeneyi Düzenle</DialogTitle>
            <DialogDescription>Muayene bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Teşhis</label>
              <Textarea
                name="diagnosis"
                placeholder="Hastanın teşhisini giriniz"
                value={formData.diagnosis}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tedavi</label>
              <Textarea
                name="treatment"
                placeholder="Önerilen tedaviyi giriniz"
                value={formData.treatment}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdateExamination}>Güncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Examinations

