import Badge from "@/components/Badge";
import { User } from "lucide-react";

interface StudentCardProps {
    name: string;
    fatherName: string;
    status: "Active" | "Left";
    enrollment?: string;
    onView?: () => void;
}

export default function StudentCard({ name, fatherName, status, enrollment, onView }: StudentCardProps) {
    return (
        <div
            onClick={onView}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition-colors cursor-pointer active:scale-[0.99] transform duration-100"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold font-urdu text-lg leading-none">{name}</h3>
                        <p className="text-sm text-gray-500 font-urdu mt-1">ولد: {fatherName}</p>
                    </div>
                </div>
                <Badge variant={status === "Active" ? "success" : "destructive"}>
                    {status === "Active" ? "حاضر" : "خارج"}
                </Badge>
            </div>

            {enrollment && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-urdu">کلاس:</span>
                    <span className="font-medium font-urdu bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {enrollment}
                    </span>
                </div>
            )}
        </div>
    );
}
