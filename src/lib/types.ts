// typescript types for users and scans

export type Scan = {
    activity_name: String;
    activity_category: String;
    scanned_at: Date; // maybe needs to be string instead
}

export type User = {
    name: string;
    email: string;
    phone: string;
    badge_code: String;
    scans: Scan[];
    updated_at: Date;  // maybe needs to be string instead
}