// hooks/useTeacherOperations.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  uploadTeacherImage,
  createTeacher,
  getTeachers,
  GetTeachersParams,
  uploadTeacherPDF,
} from '../api/pagesApi/teacherApi';

export const useTeacherOperations = (
  params?: GetTeachersParams,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  // ✅ GET - O'qituvchilarni olish (pagination bilan)
  const {
    data: teachersData,
    isLoading: isTeachersLoading,
    isFetching: isTeachersFetching,
    error: teachersError,
    refetch,
  } = useQuery({
    queryKey: ['teachers', params],
    queryFn: () => getTeachers(params),
  });

  // ✅ Rasm yuklash
  const uploadImageMutation = useMutation({
    mutationFn: uploadTeacherImage,
    onSuccess: data => {
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Rasm yuklashda xatolik!');
      throw error;
    },
  });

  // PDF yuklash
  const uploadPDFMutation = useMutation({
    mutationFn: uploadTeacherPDF,
    onSuccess: data => {
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'PDF yuklashda xatolik!');
      throw error;
    },
  });

  // ✅ CREATE - O'qituvchi qo'shish
  const createTeacherMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      toast.success("O'qituvchi muvaffaqiyatli qo'shildi!");
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "O'qituvchi qo'shishda xatolik yuz berdi!"
      );
    },
  });

  // // ✅ UPDATE - O'qituvchini yangilash
  // const updateTeacherMutation = useMutation({
  //   mutationFn: updateTeacher,
  //   onSuccess: () => {
  //     toast.success("O'qituvchi muvaffaqiyatli yangilandi!");
  //     queryClient.invalidateQueries({ queryKey: ['teachers'] });
  //     onSuccess?.();
  //   },
  //   onError: (error: any) => {
  //     toast.error(
  //       error?.response?.data?.message ||
  //         "O'qituvchi yangilashda xatolik yuz berdi!"
  //     );
  //   },
  // });

  // ✅ DELETE - O'qituvchini o'chirish
  // const deleteTeacherMutation = useMutation({
  //   mutationFn: deleteTeacher,
  //   onSuccess: () => {
  //     toast.success("O'qituvchi muvaffaqiyatli o'chirildi!");
  //     queryClient.invalidateQueries({ queryKey: ['teachers'] });
  //   },
  //   onError: (error: any) => {
  //     toast.error(
  //       error?.response?.data?.message ||
  //         "O'qituvchi o'chirishda xatolik yuz berdi!"
  //     );
  //   },
  // });

  return {
    // Data (pagination bilan)
    teachers: teachersData?.body || [],
    total: teachersData?.totalElements || 0,
    page: teachersData?.page || 0,
    size: teachersData?.size || 10,
    totalPages: teachersData?.totalPage || 1,
    isTeachersLoading,
    isTeachersFetching,
    teachersError,
    refetch,

    // Mutations
    uploadImageMutation,
    uploadPDFMutation,
    createTeacherMutation,
    // updateTeacherMutation,
    // deleteTeacherMutation,
  };
};
