import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Table, Input, Button, Tag, Popconfirm, Typography, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import axiosClient from "../api/axiosClient";
import ThesisFormModal from "../components/ThesisFormModal/ThesisFormModal";

const { Title, Text } = Typography;

const Thesis = () => {
  const { t } = useTranslation();
  const role = localStorage.getItem("role");
  const studentCode = localStorage.getItem("code");

  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [registeredThesisId, setRegisteredThesisId] = useState("");
  const [isTeacherDeadlineActive, setIsTeacherDeadlineActive] = useState(false);
  const [isStudentDeadlineActive, setIsStudentDeadlineActive] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingThesis, setEditingThesis] = useState(null); // null = "add" mode

  const fetchTheses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/theses", {
        params: { limit: 100 },
      });
      setTheses(data.data.items);
    } catch (error) {
      toast.error(error.response?.data?.message || t("auth.genericError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchDeadline = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/deadlines");
      if (data?.endDate) setDeadlineDate(dayjs(data.endDate));
    } catch {
      // no active deadline configured — not an error state for the page
    }
  }, []);

  const fetchRegisteredThesis = useCallback(async () => {
    if (role !== "student") return;
    try {
      const { data } = await axiosClient.get("/theses/registered");
      setRegisteredThesisId(data.data.registeredThesisId || "");
    } catch {
      /* no-op */
    }
  }, [role]);

  const fetchDeadlineStatus = useCallback(async () => {
    try {
      await axiosClient.get("/deadlines/teacher");
      setIsTeacherDeadlineActive(true);
    } catch {
      setIsTeacherDeadlineActive(false);
    }
    try {
      await axiosClient.get("/deadlines/student");
      setIsStudentDeadlineActive(true);
    } catch {
      setIsStudentDeadlineActive(false);
    }
  }, []);

  useEffect(() => {
    fetchTheses();
    fetchDeadline();
    fetchRegisteredThesis();
    fetchDeadlineStatus();
  }, [fetchTheses, fetchDeadline, fetchRegisteredThesis, fetchDeadlineStatus]);

  const filteredTheses = useMemo(
    () =>
      theses.filter((item) =>
        item.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [theses, searchTerm],
  );

  const handleAdd = () => {
    setEditingThesis(null);
    setModalOpen(true);
  };

  const handleEdit = (thesis) => {
    setEditingThesis(thesis);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingThesis) {
        const { data } = await axiosClient.put(
          `/theses/update/${editingThesis._id}`,
          values,
        );
        toast.success(data.message);
      } else {
        const { data } = await axiosClient.post("/theses", values);
        toast.success(data.message);
      }
      setModalOpen(false);
      fetchTheses();
    } catch (error) {
      toast.error(error.response?.data?.message || t("auth.genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axiosClient.delete(`/theses/${id}`);
      toast.success(data.message);
      fetchTheses();
    } catch (error) {
      toast.error(error.response?.data?.message || t("auth.genericError"));
    }
  };

  const handleToggleRegister = async (id) => {
    try {
      const { data } = await axiosClient.put(`/theses/change/${id}`);
      setRegisteredThesisId((prev) => (prev === id ? "" : id));
      toast.success(data.message);
      fetchTheses();
    } catch (error) {
      toast.error(error.response?.data?.message || t("thesis.registerFailed"));
    }
  };

  const columns = [
    {
      title: t("thesis.columns.no"),
      render: (_v, _r, index) => index + 1,
      width: 60,
    },
    { title: t("thesis.columns.semester"), dataIndex: "semester", width: 70 },
    { title: t("thesis.columns.year"), dataIndex: "year", width: 100 },
    { title: t("thesis.columns.instructor"), dataIndex: "instructorName" },
    {
      title: t("thesis.columns.instructorCode"),
      dataIndex: "instructorCode",
      width: 100,
    },
    {
      title: t("thesis.columns.instructorPhone"),
      dataIndex: "instructorPhone",
      width: 120,
    },
    { title: t("thesis.columns.thesisName"), dataIndex: "thesisName" },
    {
      title: t("thesis.columns.quantity"),
      width: 90,
      render: (_v, thesis) => (
        <Tag
          color={
            thesis.members.length >= thesis.studentQuantity ? "red" : "blue"
          }>
          {thesis.members.length}/{thesis.studentQuantity}
        </Tag>
      ),
    },
    { title: t("thesis.columns.requirement"), dataIndex: "require" },
    {
      title: t("thesis.columns.actions"),
      width: 180,
      render: (_v, thesis) => {
        if (role === "student") {
          const isRegisteredHere = registeredThesisId === thesis._id;
          return (
            <Button
              type={isRegisteredHere ? "default" : "primary"}
              danger={isRegisteredHere}
              size="small"
              disabled={
                !isStudentDeadlineActive ||
                (!isRegisteredHere && !!registeredThesisId)
              }
              onClick={() => handleToggleRegister(thesis._id)}>
              {isRegisteredHere ? t("thesis.unregister") : t("thesis.register")}
            </Button>
          );
        }

        if (role === "teacher") {
          return (
            <Space>
              <Button
                size="small"
                disabled={!isTeacherDeadlineActive}
                onClick={() => handleEdit(thesis)}>
                {t("thesis.edit")}
              </Button>
              <Popconfirm
                title={t("thesis.deleteConfirmTitle")}
                description={t("thesis.deleteConfirmDesc")}
                okText={t("thesis.delete")}
                cancelText={t("common.cancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(thesis._id)}
                disabled={!isTeacherDeadlineActive}>
                <Button size="small" danger disabled={!isTeacherDeadlineActive}>
                  {t("thesis.delete")}
                </Button>
              </Popconfirm>
            </Space>
          );
        }

        return null; // admin: read-only view
      },
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Title level={3} className="!mb-0">
          {t("thesis.title")}
        </Title>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder={t("thesis.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-72"
          />
          {role === "teacher" && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              {t("thesis.addNew")}
            </Button>
          )}
        </div>
      </div>

      {deadlineDate && (
        <Text type="secondary" className="block mb-3">
          {t("thesis.deadline")}: {deadlineDate.format("DD/MM/YYYY HH:mm")}
        </Text>
      )}

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredTheses}
        loading={loading}
        locale={{ emptyText: t("thesis.noData") }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
      />

      <ThesisFormModal
        open={modalOpen}
        mode={editingThesis ? "edit" : "add"}
        initialValues={
          editingThesis
            ? {
                thesisName: editingThesis.thesisName,
                studentQuantity: editingThesis.studentQuantity,
                require: editingThesis.require,
              }
            : undefined
        }
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Thesis;
