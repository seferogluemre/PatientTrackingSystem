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

interface DoctorsListProps {
    doctors: any;
    isLoading: boolean;
    onSelectDoctor: (tcNo: string) => void;
}

const DoctorsList: React.FC<DoctorsListProps> = ({
    doctors,
    isLoading,
    onSelectDoctor,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredDoctors, setFilteredDoctors] = useState(doctors);

    useEffect(() => {
        if (searchTerm) {
            const filtered = doctors.filter(
                (doctor) =>
                    doctor.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDoctors(filtered);
        } else {
            setFilteredDoctors(doctors);
        }
    }, [searchTerm, doctors]);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Doktor ara..."
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
                                <TableHead>Uzmanlık</TableHead>
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
                            ) : filteredDoctors.length > 0 ? (
                                filteredDoctors.map((doctor) => (
                                    <TableRow key={doctor.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">
                                            {doctor.user.first_name} {doctor.user.last_name}
                                        </TableCell>
                                        <TableCell>{doctor.specialty}</TableCell>
                                        <TableCell className="hidden md:table-cell">{doctor.user.email}</TableCell>
                                        <TableCell className="hidden md:table-cell">{doctor.tc_no}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onSelectDoctor(doctor.tc_no)}
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

export default DoctorsList