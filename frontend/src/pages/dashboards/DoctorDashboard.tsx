"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  ChevronRight,
  Stethoscope,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import AppointmentCard from "@/components/ui-custom/AppointmentCard"
import StatsCard from "@/components/ui-custom/StatsCard"
import PatientCard from "@/components/ui-custom/PatientCard"
import type { User, Appointment, Patient, AppointmentStatus, Doctor } from "@/types"
import { getDoctorAppointments } from "@/services/appointmentService"
import { getDoctors } from "@/services/userService"

interface DoctorDashboardProps {
  user: User
}

const DoctorDashboard = ({ user }: DoctorDashboardProps) => {
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (user) {
        setLoading(true)
        try {
          const doctorInfoStr = localStorage.getItem("clinicUser")

          if (doctorInfoStr) {
            const doctorInfo = JSON.parse(doctorInfoStr)
            setDoctor(doctorInfo)
            console.log("if bloguna girdi")

            // Doktorlar listesini al
            const doctors = await getDoctors()
            console.log("Doktorlar:", doctors)

            // TC numarasına göre doktoru bul
            const currentDoctor = doctors.find((doc) => doc.tc_no === doctorInfo.tc_no)

            console.log(currentDoctor)
            if (!currentDoctor) {
              console.error("Doktor bulunamadı!")
              toast.error("Doktor bilgileri bulunamadı")
              setLoading(false)
              return
            }

            console.log("Bulunan doktor:", currentDoctor)

            // Doktor ID'sini kullanarak randevuları al
            const response = await getDoctorAppointments(currentDoctor.id)
            console.log("RESPONSEEEE", response.results.results)

            if (response) {

              const doctorAppointments = response.results.results;

              console.log("Doktor randevuları:", doctorAppointments);
              if (!doctorAppointments || doctorAppointments.length === 0) {
                console.log("Randevu bulunamadı");
                setLoading(false);
                return;
              }

              // Format appointments
              const formattedAppointments = doctorAppointments.map((appointment: any) => ({
                id: appointment.id || Math.random(),
                patient_id: appointment.patient_id,
                patientId: appointment.patient_id,
                doctor_id: appointment.doctor_id,
                doctorId: appointment.doctor_id,
                appointment_date: new Date(appointment.appointment_date),
                appointmentDate: new Date(appointment.appointment_date),
                status: appointment.completed_at ? "completed" : "pending" as AppointmentStatus,
                description: appointment.description,
                patient: appointment.patient
                  ? {
                    id: appointment.patient.id,
                    first_name: appointment.patient.first_name,
                    last_name: appointment.patient.last_name,
                    email: appointment.patient.email,
                    birthDate: appointment.patient.birthDate,
                    dob: appointment.patient.birthDate,
                    phone: appointment.patient.phone || "",
                    address: appointment.patient.address || "",
                    firstName: appointment.patient.first_name,
                    lastName: appointment.patient.last_name,
                  }
                  : undefined,
                doctor: {
                  id: currentDoctor.id,
                  user_id: currentDoctor.user_id || 0,
                  specialty: currentDoctor.specialty || "",
                  clinic_id: currentDoctor.clinic_id || 0,
                  user: {
                    id: currentDoctor.user_id || 0,
                    first_name: doctorInfo.first_name,
                    last_name: doctorInfo.last_name,
                    email: doctorInfo.email,
                    role: "doctor" as const,
                  },
                },
                examination: appointment.examinations && appointment.examinations.length > 0
                  ? appointment.examinations[0]
                  : undefined,
              }))

              // Sort appointments by date (newest first)
              formattedAppointments.sort(
                (a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime(),
              )

              console.log("Formatlanmış randevular:", formattedAppointments);

              // Recent appointments (last 5)
              setRecentAppointments(formattedAppointments.slice(0, 5))

              // Today's appointments
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const tomorrow = new Date(today)
              tomorrow.setDate(tomorrow.getDate() + 1)

              const todayAppts = formattedAppointments.filter((appointment: Appointment) => {
                const apptDate = new Date(appointment.appointment_date)
                return apptDate >= today && apptDate < tomorrow
              })

              setTodayAppointments(todayAppts)
              console.log("Bugünkü randevular:", todayAppts);

              // Fetch patients
              const patientsResponse = await fetch("http://localhost:3000/api/users/patients", {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("clinicToken")}`,
                },
              })
              const patientsData = await patientsResponse.json()
              console.log("Backend'den gelen ham hasta verileri:", patientsData)

              if (patientsData && patientsData.results) {
                // Format patients
                const formattedPatients = patientsData.results.map((patient: any) => ({
                  id: patient.id,
                  first_name: patient.first_name,
                  last_name: patient.last_name,
                  email: patient.email,
                  birthDate: patient.birthDate,
                  dob: patient.birthDate,
                  phone: patient.phone || "",
                  address: patient.address || "",
                  user: {
                    id: patient.id,
                    first_name: patient.first_name,
                    last_name: patient.last_name,
                    email: patient.email,
                    phone: patient.phone || "",
                    address: patient.address || "",
                    birthDate: patient.birthDate,
                    role: "patient" as const
                  }
                }));
                console.log("Formatlanmış hasta verileri:", formattedPatients);

                // Filter patients for this doctor
                const patientIds = new Set(formattedAppointments.map((appt: Appointment) => appt.patient_id))
                const doctorPatients = formattedPatients.filter((patient: Patient) => patientIds.has(patient.id))
                setRecentPatients(doctorPatients.slice(0, 4))
                console.log("Doktorun hastaları:", doctorPatients);
              }
            } else {
              console.log("Geçerli randevu yanıtı alınamadı");
            }
          }
        } catch (error) {
          console.error("Doktor verileri yüklenirken hata oluştu:", error)
          toast.error("Veriler yüklenirken bir hata oluştu")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchDoctorData()
  }, [user])


  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    try {
      await fetch(`http://localhost:3000/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      // UI'ı güncelle
      const updatedRecent = recentAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      )

      const updatedToday = todayAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      )

      setRecentAppointments(updatedRecent)
      setTodayAppointments(updatedToday)

      toast.success(`Randevu durumu ${status === "completed" ? "tamamlandı" : status} olarak güncellendi`)
    } catch (error) {
      console.error("Randevu durumu güncellenirken hata:", error)
      toast.error("Randevu durumu güncellenirken bir hata oluştu")
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg">Veriler yükleniyor...</div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Hoş geldiniz, Dr. {user.firstName || user.first_name} {user.lastName || user.last_name}
          </h1>
          <p className="text-slate-500 mt-1">{format(new Date(), "dd MMMM yyyy, EEEE", { locale: tr })}</p>
        </div>

        <Button onClick={() => navigate("/appointments/new")}>
          <CalendarDays className="mr-2 h-4 w-4" />
          Yeni Randevu
        </Button>
      </motion.div>

      {/* Stats kartları */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Toplam Hasta"
          value={doctor?.id ? recentPatients.length : 0}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Bugünkü Randevular"
          value={todayAppointments.length}
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatsCard
          title="Bekleyen Randevular"
          value={recentAppointments.filter((a) => a.status === "pending").length}
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Tamamlanan Muayeneler"
          value={recentAppointments.filter((a) => a.status === "completed").length}
          icon={<Stethoscope className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
      </motion.div>

      {/* Ana içerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol kolon */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          {/* Bugünün randevuları */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Bugünkü Randevular</CardTitle>
                  <CardDescription>
                    {format(new Date(), "d MMMM", { locale: tr })} tarihindeki randevularınız
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/appointments")}>
                  Tümünü Gör
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${appointment.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {appointment.status === "pending" ? (
                            <Clock className="h-5 w-5" />
                          ) : appointment.status === "completed" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{format(new Date(appointment.appointmentDate), "HH:mm")}</p>
                          <p className="text-sm text-slate-500">
                            {appointment.patient
                              ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                              : "Hasta bilgisi yok"}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/examinations/new?appointmentId=${appointment.id}`)}
                        >
                          <ClipboardList className="mr-1 h-4 w-4" />
                          Muayene Et
                        </Button>
                        <Button
                          size="sm"
                          variant={appointment.status === "completed" ? "ghost" : "default"}
                          onClick={() => handleStatusChange(appointment.id, "completed")}
                          disabled={appointment.status === "completed"}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Tamamla
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-2 text-lg font-medium">Bugün için randevu yok</h3>
                  <p className="text-sm text-slate-500 mt-1">Bugün için planlanmış randevunuz bulunmamaktadır.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Son Muayeneler */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Son Muayeneler</CardTitle>
                  <CardDescription>Tamamladığınız son muayeneler</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments
                  .filter((appointment) => appointment.status === "completed")
                  .slice(0, 3)
                  .map((appointment) => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-medium">
                            {appointment.patient
                              ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                              : "Hasta bilgisi yok"}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {format(new Date(appointment.appointmentDate), "d MMMM yyyy, HH:mm", { locale: tr })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/examinations/${appointment.examination?.id || 0}`)}
                        >
                          Detaylar
                        </Button>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="text-slate-700 font-medium">Şikayet:</p>
                        <p className="text-slate-600">{appointment.description || "Belirtilmemiş"}</p>
                      </div>
                      {appointment.examination && (
                        <div className="mt-2 text-sm">
                          <p className="text-slate-700 font-medium">Teşhis:</p>
                          <p className="text-slate-600">{appointment.examination.diagnosis}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/examinations")}>
                Tüm Muayeneleri Görüntüle
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Sağ kolon */}
        <motion.div variants={item} className="space-y-6">
          {/* Yaklaşan Randevular */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Yaklaşan Randevular</CardTitle>
              <CardDescription>Önümüzdeki randevularınız</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments
                  .filter((appointment) => appointment.status === "pending")
                  .slice(0, 4)
                  .map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      userRole="doctor"
                      onStatusChange={handleStatusChange}
                    />
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/appointments")}>
                Tüm Randevuları Görüntüle
              </Button>
            </CardFooter>
          </Card>


        </motion.div>
      </div>
    </motion.div>
  )
}

export default DoctorDashboard

