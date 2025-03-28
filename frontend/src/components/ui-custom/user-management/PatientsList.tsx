import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PatientResponse } from "@/types/api";

interface PatientsListProps {
    patients: PatientResponse["results"];
    isLoading: boolean;
    onSelectPatient: (tcNo: string) => void;
}

const PatientsList: React.FC<PatientsListProps> = ({
    patients,
    isLoading,
    onSelectPatient,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPatients, setFilteredPatients] = useState(patients);

    useEffect(() => {
        if (searchTerm) {
            const filtered = patients.filter(
                (patient) =>
                    patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);

    // Format date from ISO to DD.MM.YYYY
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR");
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Hasta ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>İsim</TableHead>
                                <TableHead className="hidden md:table-cell">Doğum Tarihi</TableHead>
                                <TableHead className="hidden md:table-cell">E-posta</TableHead>
                                <TableHead className="hidden md:table-cell">TC No</TableHead>
                                <TableHead className="w-[100px] text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <TableRow key={patient.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">
                                            {patient.first_name} {patient.last_name}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {patient.user.birthDate ? formatDate(patient.user.birthDate) : "Belirtilmemiş"}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{patient.email}</TableCell>
                                        <TableCell className="hidden md:table-cell">{patient.tc_no}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onSelectPatient(patient.tc_no)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        Sonuç bulunamadı
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default PatientsList