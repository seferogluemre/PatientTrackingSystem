"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Plus, Search, Calendar, CheckCircle, XCircle, Clock, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Layout from "@/components/ui-custom/Layout"
import AppointmentCard from "@/components/ui-custom/AppointmentCard"
import type { User, Appointment, AppointmentStatus, Doctor, Patient } from "@/types"

type FilterStatus = "all" | AppointmentStatus

interface ApiAppointment {
  id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  status: AppointmentStatus
  description: string
  completed_at?: string
  secretaryId?: number
  patient?: {
    id: number
    first_name: string
    last_name: string
    email: string
    tc_no: string
  }
  doctor?: {
    id: number
    specialty: string
    clinic_id: number
    tc_no: string
  }
}

const Appointments = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])

  // Form state for new appointment
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    description: "",
  })

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const patientId = queryParams.get("patientId")

    if (patientId) {
      setFormData((prev) => ({ ...prev, patientId }))
      setIsCreateDialogOpen(true)
    }
  }, [location.search])

  useEffect(() => {
    const storedUser = localStorage.getItem("clinicUser")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)

      // Fetch doctors and patients for dropdown
      fetchDoctorsAndPatients()
    } else {
      navigate("/")
    }
  }, [navigate])

  // Update the fetchDoctorsAndPatients function to correctly map the doctor data
  const fetchDoctorsAndPatients = async () => {
    try {
      // Fetch available doctors and patients for dropdowns
      const response = await fetch("http://localhost:3000/api/users/patients")
      const data = await response.json()
      if (data.results) {
        const patientList = data.results.map((p: any) => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          email: p.email,
          dob: new Date(),
          phone: p.phone || "",
          address: p.address || "",
        }))
        setPatients(patientList)
        console.log("patient list", patientList)
      }

      // Fetch doctors
      const doctorsResponse = await fetch("http://localhost:3000/api/users/doctors")
      const doctorsData = await doctorsResponse.json()
      console.log("doctors response", doctorsData)

      setDoctors(doctorsData.results)
    }
    catch (error) {
      console.error("Error fetching doctors and patients:", error)
      toast.error("Doktor ve hasta bilgileri yüklenirken hata oluştu")
    }
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Fetch all appointments
        const response = await fetch("http://localhost:3000/api/appointments")
        const appointmentsData = await response.json()

        if (appointmentsData && appointmentsData.results) {
          const formattedAppointments = appointmentsData.results.map((appointment: ApiAppointment) => {
            // Önce doktoru bul
            const doctor = doctors.find(d => d.id === appointment.doctor_id);
            
            return {
              id: appointment.id,
              patientId: appointment.patient_id,
              doctorId: appointment.doctor_id,
              appointmentDate: new Date(appointment.appointment_date),
              status: appointment.status,
              description: appointment.description,
              patient: appointment.patient
                ? {
                  id: appointment.patient.id,
                  firstName: appointment.patient.first_name,
                  lastName: appointment.patient.last_name,
                  email: appointment.patient.email,
                  dob: new Date(),
                  phone: "",
                  address: "",
                }
                : undefined,
              doctor: doctor
                ? {
                  id: doctor.id,
                  userId: doctor.userId || 0,
                  specialty: doctor.specialty || "",
                  clinicId: doctor.clinicId || 0,
                  user: {
                    id: doctor.userId || 0,
                    first_name: doctor.user?.first_name || "",
                    last_name: doctor.user?.last_name || "",
                    email: doctor.user?.email || "",
                    role: "doctor",
                  },
                }
                : undefined,
            };
          });

          setAppointments(formattedAppointments)
          setFilteredAppointments(formattedAppointments)
        } else {
          setAppointments([])
          setFilteredAppointments([])
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Randevular yüklenirken bir hata oluştu")
        setAppointments([])
        setFilteredAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user, doctors])

  useEffect(() => {
    if (appointments.length) {
      let filtered = [...appointments]

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((appointment) => appointment.status === statusFilter)
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter((appointment) => {
          const patientName = appointment.patient
            ? `${appointment.patient.first_name} ${appointment.patient.last_name}`.toLowerCase()
            : ""
          const doctorName =
            appointment.doctor && appointment.doctor.user
              ? `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`.toLowerCase()
              : ""
          const description = appointment.description?.toLowerCase() || ""

          return patientName.includes(query) || doctorName.includes(query) || description.includes(query)
        })
      }

      setFilteredAppointments(filtered)
    }
  }, [appointments, searchQuery, statusFilter])

  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    try {
      // Call the API to update appointment status
      await fetch(`http://localhost:3000/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      // Update the local state
      const updatedAppointments = appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      )

      const updatedFiltered = filteredAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      )

      setAppointments(updatedAppointments)
      setFilteredAppointments(updatedFiltered)

      toast.success(`Randevu durumu başarıyla ${status === "completed" ? "tamamlandı" : "iptal edildi"}`)
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast.error("Randevu durumu güncellenirken bir hata oluştu")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateAppointment = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error("Lütfen tüm gerekli alanları doldurun")
      return
    }
    const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`)
    try {
      const response = await fetch("http://localhost:3000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: Number.parseInt(formData.patientId),
          doctor_id: Number.parseInt(formData.doctorId),
          date: dateTime.toISOString(),
          status: "pending",
          description: formData.description,
          secretary_id: user?.role === "secretary" ? user.id : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create appointment")
      }

      const newAppointmentData = await response.json()

      // Find the patient and doctor objects for the new appointment
      const patient = patients.find((p) => p.id === Number.parseInt(formData.patientId))
      const doctor = doctors.find((d) => d.id === Number.parseInt(formData.doctorId))

      // Create a new appointment object with the returned data
      const newAppointment: Appointment = {
        id: newAppointmentData.id || appointments.length + 1,
        patientId: Number.parseInt(formData.patientId),
        doctorId: Number.parseInt(formData.doctorId),
        appointmentDate: dateTime,
        status: "pending",
        description: formData.description,
        patient: patient,
        doctor: doctor,
      }

      // Add to appointments and filtered appointments
      setAppointments([newAppointment, ...appointments])

      // Apply current filters to the new appointment
      if (statusFilter === "all" || statusFilter === "pending") {
        setFilteredAppointments([newAppointment, ...filteredAppointments])
      }

      // Close dialog and reset form
      setIsCreateDialogOpen(false)
      setFormData({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        description: "",
      })

      toast.success("Randevu başarıyla oluşturuldu")
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast.error("Randevu oluşturulurken bir hata oluştu")
    }
  }

  // Calculate stats
  const totalAppointments = appointments.length
  const pendingAppointments = appointments.filter((a) => a.status === "pending").length
  const completedAppointments = appointments.filter((a) => a.status === "completed").length
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled").length

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  if (!user) {
    return null
  }

  console.log("Doctrorrr", doctors)

  return (
    <Layout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold">Randevular</h1>
            <p className="text-slate-500 mt-1">Randevuları görüntüleyin ve yönetin</p>
          </div>

          {user.role !== "patient" && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Randevu
            </Button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam</p>
                <p className="text-2xl font-bold">{totalAppointments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Bekleyen</p>
                <p className="text-2xl font-bold">{pendingAppointments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tamamlanan</p>
                <p className="text-2xl font-bold">{completedAppointments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">İptal Edilen</p>
                <p className="text-2xl font-bold">{cancelledAppointments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Hasta veya doktor adı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Randevular</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="completed">Tamamlanan</SelectItem>
                <SelectItem value="cancelled">İptal Edilen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Loading indicator */}
        {loading ? (
          <motion.div variants={item} className="flex justify-center py-12">
            <div className="animate-pulse text-lg">Randevular yükleniyor...</div>
          </motion.div>
        ) : // Appointments list
          filteredAppointments.length > 0 ? (
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole={user.role}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div variants={item} className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-lg font-medium">Randevu bulunamadı</h3>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Filtreleme kriterlerinize uygun randevu bulunamadı."
                  : "Henüz randevu oluşturulmamış."}
              </p>
            </motion.div>
          )}
      </motion.div>

      {/* Create appointment dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
            <DialogDescription>Yeni bir randevu oluşturmak için aşağıdaki bilgileri doldurun.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Update the doctor select box to display the specialty */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctorId" className="text-right">
                Doktor
              </Label>
              <div className="col-span-3">
                <Select
                  name="doctorId"
                  value={formData.doctorId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, doctorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Doktor seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.user.first_name} {doctor.user.last_name} ({doctor.specialty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patientId" className="text-right">
                Hasta
              </Label>
              <div className="col-span-3">
                <Select
                  name="patientId"
                  value={formData.patientId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, patientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hasta seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentDate" className="text-right">
                Tarih
              </Label>
              <div className="col-span-3">
                <Input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentTime" className="text-right">
                Saat
              </Label>
              <div className="col-span-3">
                <Input
                  id="appointmentTime"
                  name="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Açıklama
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Randevu açıklaması"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateAppointment}>Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

export default Appointments

