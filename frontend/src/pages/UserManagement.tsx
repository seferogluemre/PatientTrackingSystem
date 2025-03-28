import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getDoctors, getPatients } from "@/services/userService";
import DoctorsList from "@/components/ui-custom/user-management/DoctorsList";
import PatientsList from "@/components/ui-custom/user-management/PatientsList";
import UserDetailModal from "@/components/ui-custom/user-management/UserDetailModal";

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState("doctors");
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [selectedUserTcNo, setSelectedUserTcNo] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoadingDoctors(false);
            const doctors = await getDoctors()
            setDoctors(doctors)
        }
        fetchDoctors();
    }, [toast]);

    useEffect(() => {
        const fetchPatients = async () => {
            setLoadingPatients(false);
            const patients = await getPatients()
            setDoctors(patients)
        }
        fetchPatients();
    }, [toast]);

    const handleSelectDoctor = (tcNo: string) => {
        setSelectedUserTcNo(tcNo);
        setIsDetailModalOpen(true);
    };

    const handleSelectPatient = (tcNo: string) => {
        setSelectedUserTcNo(tcNo);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedUserTcNo(null);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
                <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    {activeTab === "doctors" ? "Yeni Doktor Ekle" : "Yeni Hasta Ekle"}
                </Button>
            </div>

            <Tabs defaultValue="doctors" onValueChange={(value) => {
                setActiveTab(value);
            }}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="doctors">Doktorlar</TabsTrigger>
                    <TabsTrigger value="patients">Hastalar</TabsTrigger>
                </TabsList>

                <TabsContent value="doctors">
                    <DoctorsList
                        doctors={doctors}
                        isLoading={loadingDoctors}
                        onSelectDoctor={handleSelectDoctor}
                    />
                </TabsContent>

                <TabsContent value="patients">
                    <PatientsList
                        patients={patients}
                        isLoading={loadingPatients}
                        onSelectPatient={handleSelectPatient}
                    />
                </TabsContent>
            </Tabs>

            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                tcNo={selectedUserTcNo}
            />
        </div>
    );
};

export default UserManagement