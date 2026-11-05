export interface Countries {
    id: number;
    abbreviation_A3: string;
    country_name: string;
    language: string;
    phone_code: string;
    image: string;
};

export interface Cities {
    id: number;
    department_id: number;
    city_code: string;
    name_city: string;
    name_department: string;
}

export interface Departments {
    id: number;
    country_id: number;
    code: string;
    name_department: string;
    abbreviation: string;
}
