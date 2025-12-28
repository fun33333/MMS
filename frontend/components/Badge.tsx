import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

const variants = {
    default: "border-transparent bg-gray-900 text-white hover:bg-gray-900/80",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80",
    destructive: "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
    success: "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
    warning: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200",
    outline: "text-gray-950 border-gray-200",
}

export default function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 font-urdu ${variants[variant]} ${className}`} {...props} />
    )
}
