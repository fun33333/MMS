import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: "green" | "blue" | "orange" | "purple";
}

const colorStyles = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
}

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 font-urdu mb-1">{title}</p>
                <h3 className="text-2xl font-bold font-urdu">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}
