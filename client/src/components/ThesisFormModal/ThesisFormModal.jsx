import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";
import { useTranslation } from "react-i18next";

/**
 * One modal handles both create and edit — mode is inferred from
 * whether `initialValues` (and thus `thesisId`) is provided.
 */
const ThesisFormModal = ({
  open,
  mode = "add",
  initialValues,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        initialValues ?? {
          semester: "",
          year: "",
          thesisName: "",
          studentQuantity: undefined,
          require: "",
        },
      );
    }
  }, [open, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => onSubmit(values));
  };

  return (
    <Modal
      open={open}
      title={
        mode === "edit" ? t("thesis.formEditTitle") : t("thesis.formAddTitle")
      }
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      destroyOnClose>
      <Form form={form} layout="vertical" requiredMark={false}>
        {mode !== "edit" && (
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="semester"
              label={t("thesis.form.semester")}
              rules={[
                { required: true, message: t("thesis.form.semesterRequired") },
              ]}>
              <Input placeholder="1, 2, 3..." />
            </Form.Item>
            <Form.Item
              name="year"
              label={t("thesis.form.year")}
              rules={[
                { required: true, message: t("thesis.form.yearRequired") },
              ]}>
              <Input placeholder="2025-2026" />
            </Form.Item>
          </div>
        )}

        <Form.Item
          name="thesisName"
          label={t("thesis.form.thesisName")}
          rules={[
            { required: true, message: t("thesis.form.thesisNameRequired") },
          ]}>
          <Input />
        </Form.Item>

        <Form.Item
          name="studentQuantity"
          label={t("thesis.form.quantity")}
          rules={[
            { required: true, message: t("thesis.form.quantityRequired") },
          ]}>
          <InputNumber min={1} max={10} className="!w-full" />
        </Form.Item>

        <Form.Item name="require" label={t("thesis.form.requirement")}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ThesisFormModal;
