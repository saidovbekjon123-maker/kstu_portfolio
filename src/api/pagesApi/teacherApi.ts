// api/pagesApi/teachersApi.ts
import axiosClient from '../axiosClient';
import { API_ENDPOINTS } from '../endpoints';

// ✅ Types (API dan kelayotgan ma'lumotlarga mos)
export interface Teacher {
  id: number;
  name: string;
  lavozim: string;
  email: string;
  imgUrl: string;
  input: string; 
  phoneNumber: string;
  departmentName: string;
}

export interface TeacherCreateData {
  fullName: string;
  phoneNumber: string;
  biography: string;
  imgUrl: string;
  fileUrl:string;
  input: string;
  profession:string;
  lavozmId: number;
  email: string;
  age: number;
  gender: boolean;
  password: string;
  departmentId: number;
}

export interface TeacherUpdateData {
  fullName?: string;
  phoneNumber?: string;
  biography?: string;
  imgUrl?: string;
  input?: string;
  lavozmId?: number;
  email?: string;
  age?: number;
  gender?: boolean;
  departmentId?: number;
  fileUrl?: string;
  profession?: string;
}

export interface GetTeachersParams {
  page?: number;
  size?: number;
  name?: string;
  lavozim?: string;
  college?: string;
}

// ✅ Backend response struktura
export interface TeachersResponse {
  success: boolean;
  message: string;
  data: {
    page: number;
    size: number;
    totalPage: number;
    totalElements: number;
    body: Teacher[];
  };
}

// ✅ Rasm yuklash
export const uploadTeacherImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.post(API_ENDPOINTS.FILE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return (
    response.data.data ||
    response.data.imgUrl ||
    response.data.url ||
    response.data
  );
};
//PDF yuklashga
export const uploadTeacherPDF = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.post(API_ENDPOINTS.FILEPDF, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return (
    response.data.data ||
    response.data.fileUrl ||
    response.data.url ||
    response.data
  );
}; 

// ✅ GET - O'qituvchilarni olish (pagination bilan)
export const getTeachers = async (
  params?: GetTeachersParams
): Promise<TeachersResponse['data']> => {
  const queryParams: any = {
    page: params?.page ?? 0,
    size: params?.size ?? 10,
  };

  // Name filter
  if (params?.name && params.name.trim()) {
    queryParams.name = params.name.trim();
  }

  // Lavozim filter
  if (params?.lavozim && params.lavozim.trim()) {
    queryParams.lavozim = params.lavozim.trim();
  }

  // College filter
  if (params?.college && params.college.trim()) {
    queryParams.college = params.college.trim();
  }

  console.log('📤 GET Teachers Request URL:', `${API_ENDPOINTS.USERS}search`);
  console.log('📤 GET Teachers Request params:', queryParams);

  try {
    const response = await axiosClient.get<TeachersResponse>(
      `${API_ENDPOINTS.USERS}search`,
      {
        params: queryParams,
      }
    );

    console.log('📥 GET Teachers Response:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error( 
      '❌ GET Teachers Error:',
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ CREATE - O'qituvchi qo'shish
export const createTeacher = async (
  data: TeacherCreateData
): Promise<Teacher> => {
  console.log('📤 POST Teacher Request:', data);

  try {
    const response = await axiosClient.post(API_ENDPOINTS.AUTHSAVEUSER, data);
    console.log('📥 POST Teacher Response:', response.data);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error(
      '❌ POST Teacher Error:',
      error.response?.data || error.message
    );
    throw error;
  }
};
