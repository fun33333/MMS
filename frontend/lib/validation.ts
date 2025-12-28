export const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
export const MOBILE_REGEX = /^\+92-3\d{2}-\d{7}$/;

export const validateCNIC = (cnic: string): boolean => {
    if (!cnic) return true; // Optional field
    return CNIC_REGEX.test(cnic);
};

export const validateMobile = (mobile: string): boolean => {
    return MOBILE_REGEX.test(mobile);
};

export const formatCNIC = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 13);
    if (digits.length > 12) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
};

export const formatMobile = (value: string): string => {
    // Remove all non-digits first (except + if at start, but let's simplify)
    // We want to force +92 prefix if they start typing 03 or 3

    let clean = value.replace(/[^\d+]/g, ""); // Allow digits and +

    // Auto-convert 03 to +92-3
    if (clean.startsWith("03")) {
        clean = "+92" + clean.substring(1);
    }

    // If just digits and starts with 92, fix it
    if (clean.startsWith("92")) {
        clean = "+" + clean;
    }

    // Ensure it starts with +92
    if (clean.length > 0 && !clean.startsWith("+")) {
        // if they typed 3... 
        if (clean.startsWith("3")) clean = "+92" + clean;
    }

    // Now formatting: +92-300-1234567
    // Expected digits after +: 92 (2) + 3XX (3) + XXXXXXX (7) = 12 digits total
    // But clean might have dashed.

    // Easier approach: just digits
    const digits = value.replace(/\D/g, "");

    // If empty
    if (!digits) return "";

    // If starts with 92 (PK code)
    if (digits.startsWith("92")) {
        const remaining = digits.substring(2);
        // 92-301-1234567
        // part1 (3 digits): 301
        // part2 (7 digits): 1234567

        const part1 = remaining.substring(0, 3);
        const part2 = remaining.substring(3, 10);

        let formatted = "+92";
        if (remaining.length > 0) formatted += "-" + part1;
        if (remaining.length > 3) formatted += "-" + part2;
        return formatted;
    }

    // If starts with 03 (local) -> convert to 92
    if (digits.startsWith("03")) {
        // Same logic as above but skip '0'
        const remaining = digits.substring(1); // '300...'
        // Convert to 92 format
        const part1 = remaining.substring(0, 3);
        const part2 = remaining.substring(3, 10);

        let formatted = "+92";
        if (remaining.length > 0) formatted += "-" + part1;
        if (remaining.length > 3) formatted += "-" + part2;
        return formatted;
    }

    // Fallback or other manual entry, just return as is or enforce?
    // Let's enforce +92 for consistency
    return value;
};
