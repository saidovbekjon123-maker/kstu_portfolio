// components/teacher/TeacherSidebar.tsx
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Radio,
  InputNumber,
} from 'antd';
import { useDrawerStore } from '../../stores/useDrawerStore';
import { InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { UseMutationResult } from '@tanstack/react-query';

const { Dragger } = Upload;
const { TextArea } = Input;

interface TeacherFormValues {
  fullName: string;
  phoneNumber: string;
  biography: string;
  imgUrl: string;
  input: string;
  profession:string;
  lavozmId: number; 
  email: string;
  age: number;
  gender: boolean;
  password: string;
  departmentId: number;
}

interface Department {
  id: number;
  name: string;
}

interface Position {
  id: number;
  name: string;
}

interface TeacherSidebarProps {
  initialValues?: Partial<TeacherFormValues>;
  editMode?: boolean;
  departmentList?: Department[];
  positionList?: Position[];
  createMutation: UseMutationResult<any, any, any, any>;
  uploadImageMutation: UseMutationResult<any, any, File, any>;
  uploadPDFMutation: UseMutationResult<any, any, File, any>;
}

export const TeacherSidebar = ({
  initialValues,
  editMode = false,
  departmentList = [],
  positionList = [],
  createMutation, 
  uploadImageMutation,
  uploadPDFMutation,
}: TeacherSidebarProps) => {
  const { isOpen, closeDrawer } = useDrawerStore();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [PDFfile, setPDFfile] = useState<UploadFile[]>([]);

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    setPDFfile([]);
    closeDrawer();
  };

  const handleSubmit = async () => {
  try {
    const values = await form.validateFields();

    let uploadedImageUrl = '';
    let uploadedPDFUrls: string[] = [];

    if (fileList.length > 0 && fileList[0].originFileObj) {
      const imageData = await uploadImageMutation.mutateAsync(
        fileList[0].originFileObj
      );
      uploadedImageUrl = imageData || '';
    }

    if (PDFfile.length > 0) {
      for (const file of PDFfile) {
        if (file.originFileObj) {
          const pdfUrl = await uploadPDFMutation.mutateAsync(file.originFileObj);
          uploadedPDFUrls.push(pdfUrl);
        }
      }
    }

    const formData: TeacherFormValues & { pdfUrls?: string[] } = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      biography: values.biography || '',
      imgUrl: uploadedImageUrl,
      input: values.input || '',
      profession:values.profession||'',
      lavozmId: Number(values.lavozmId),
      email: values.email,
      age: Number(values.age),
      gender: values.gender === 'male',
      password: values.password,
      departmentId: Number(values.departmentId),
      pdfUrls: uploadedPDFUrls,
    };

    await createMutation.mutateAsync(formData);
    handleClose();
  } catch (error) {
    console.error('Validation or submission failed:', error);
  }
};


  const draggerProps: UploadProps = {
    name: 'teacherImage',
    multiple: false,
    fileList,
    maxCount: 1,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Faqat rasm yuklash mumkin!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Rasm hajmi 5MB dan kichik bo'lishi kerak!");
        return false;
      }

      setFileList([
        {
          uid: '-1',
          name: file.name,
          status: 'done',
          originFileObj: file,
        } as UploadFile,
      ]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };
 const draggerPropsPDF: UploadProps = {
  name: 'teacherPDF',
  multiple: true,
  fileList: PDFfile,
  beforeUpload: (file: File & { uid?: string }) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('Faqat PDF formatdagi faylni yuklash mumkin!');
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Har bir fayl hajmi 5MB dan kichik bo'lishi kerak!");
      return Upload.LIST_IGNORE;
    }

    setPDFfile(prev => [
      ...prev,
      {
        uid: file.uid || String(Date.now() + Math.random()),
        name: file.name,
        status: 'done',
        originFileObj: file,
      } as UploadFile,
    ]);

    return false;
  },
  onRemove: (file) => {
    setPDFfile(prev => prev.filter(item => item.uid !== file.uid));
  },
};
  const isLoading =
  createMutation.isPending ||
  uploadImageMutation?.isPending ||
  uploadPDFMutation?.isPending;

  return (
    <Drawer
      title={editMode ? 'Ustozni tahrirlash' : "Yangi ustoz qo'shish"}
      placement="right"
      onClose={handleClose}
      open={isOpen}
      width={480}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} size="large" disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isLoading}
            size="large"
          >
            {editMode ? 'Saqlash' : "Qo'shish"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        autoComplete="off"
      >
        <Form.Item
          label="To'liq ism"
          name="fullName"
          rules={[{ required: true, message: "Iltimos, to'liq ism kiriting!" }]}
        >
          <Input placeholder="Ism va familiyani kiriting" size="large" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Iltimos, email kiriting!' },
            { type: 'email', message: "To'g'ri email kiriting!" },
          ]}
        >
          <Input placeholder="email@example.com" size="large" type="email" />
        </Form.Item>

        <Form.Item
          label="Telefon raqami"
          name="phoneNumber"
          rules={[
            { required: true, message: 'Iltimos, telefon raqami kiriting!' },
          ]}
        >
          <Input placeholder="+998 XX XXX XX XX" size="large" maxLength={13} />
        </Form.Item>

        <Form.Item
          label="Yosh"
          name="age"
          rules={[
            { required: true, message: 'Iltimos, yoshni kiriting!' },
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.resolve();
                }
                const age = Number(value);
                if (isNaN(age)) {
                  return Promise.reject('Faqat raqam kiriting!');
                }
                if (age < 18) {
                  return Promise.reject("Yosh kamida 18 bo'lishi kerak!");
                }
                if (age > 100) {
                  return Promise.reject('Yosh 100 dan oshmasligi kerak!');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            placeholder="Yoshni kiriting"
            size="large"
            min={18}
            max={100}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Jins"
          name="gender"
          rules={[{ required: true, message: 'Iltimos, jinsni tanlang!' }]}
        >
          <Radio.Group>
            <Radio value="male">Erkak</Radio>
            <Radio value="female">Ayol</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Parol"
          name="password"
          rules={[
            { required: true, message: 'Iltimos, parol kiriting!' },
            {
              min: 6,
              message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak!",
            },
          ]}
        >
          <Input.Password placeholder="Parolni kiriting" size="large" />
        </Form.Item>

        <Form.Item
          label="Kafedra"
          name="departmentId"
          rules={[{ required: true, message: 'Iltimos, kafedra tanlang!' }]}
        >
          <Select
            placeholder="Kafedrani tanlang"
            size="large"
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={departmentList.map(dept => ({
              value: dept.id,
              label: dept.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Lavozim"
          name="lavozmId"
          rules={[{ required: true, message: 'Iltimos, lavozim tanlang!' }]}
        >
          <Select
            placeholder="Lavozimni tanlang"
            size="large"
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={positionList.map(position => ({
              value: position.id,
              label: position.name,
            }))}
          />
        </Form.Item>

        <Form.Item label="Biografiya" name="biography">
          <TextArea
            placeholder="Qisqacha biografiya kiriting"
            rows={4}
            showCount
          />
        </Form.Item>

        <Form.Item label="Qo'shimcha ma'lumot" name="input">
          <Input placeholder="Qo'shimcha ma'lumot" size="large" />
        </Form.Item>

        <Form.Item label="Rasm">
          <Dragger {...draggerProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Rasmni yuklash uchun bosing yoki sudrab keling
            </p>
            <p className="ant-upload-hint">
              Faqat JPG, PNG, JPEG formatdagi rasmlar. Maksimal hajm: 5MB
            </p>
          </Dragger>
        </Form.Item>

        <Form.Item label="Mutaxasisligi" name="profession">
          <Input placeholder="Mutaxasisligi" size="large" />
        </Form.Item>

        <Form.Item label="PDF">
          <Dragger {...draggerPropsPDF}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              PDFni yuklash uchun bosing yoki sudrab keling
            </p>
            <p className="ant-upload-hint">
              Faqat PDF formatdagi fayllar. Maksimal hajm: 5MB
            </p>
          </Dragger>
        </Form.Item>
      </Form>
      
    </Drawer> 
  );
};
