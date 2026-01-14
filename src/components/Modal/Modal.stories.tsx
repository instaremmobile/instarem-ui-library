import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Modal, ModalProps } from './Modal';
import Input from '../Input/Input';
import { Checkbox } from '../Checkbox/Checkbox';
import RadioButton from '../Radio/RadioButton';
import DatePickerComponent from '../DatePicker/DatePicker';
import Button from '../Button/Button';

import { subYears } from 'date-fns';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { type: 'boolean', control: 'boolean' },
    closeOverlayClick: { type: 'boolean', control: 'boolean' },
    title: { type: 'string', control: 'text' },
    showCloseButton: { type: 'boolean', control: 'boolean' }
  }
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

const DefaultModalComponent = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const handleOnClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      <Modal showCloseButton={true} isOpen={isOpen} onClose={handleOnClose}>
        <div>Hello</div>
      </Modal>
    </>
  );
};

// Modal with Form Example

const ModalWithForm = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    agree: false,
    gender: 'male',
    dob: null
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setForm({
        name: '',
        email: '',
        agree: false,
        gender: 'male',
        dob: null
      });
    }, 1000);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal With Form</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="User Form" showCloseButton>
        <form
          onSubmit={handleSubmit}
          style={{
            minWidth: 450,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            style={{ marginBottom: 16, width: '100%' }}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            style={{ marginBottom: 16, width: '100%' }}
          />
          <DatePickerComponent
            label="Date of Birth"
            value={form.dob}
            onChange={(date) => handleChange('dob', date)}
            style={{ marginBottom: 16, width: '100%' }}
            maxDate={subYears(new Date(), 18)}
          />
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, width: '100%' }}>
            <span style={{ marginRight: 8 }}>Gender:</span>
            <RadioButton
              name="gender"
              value="male"
              label="Male"
              checked={form.gender === 'male'}
              onChange={() => handleChange('gender', 'male')}
              style={{ marginRight: 8 }}
            />
            <RadioButton
              name="gender"
              value="female"
              label="Female"
              checked={form.gender === 'female'}
              onChange={() => handleChange('gender', 'female')}
            />
          </div>
          <Checkbox
            label="I agree to terms"
            checked={form.agree}
            onChange={(checked) => handleChange('agree', checked)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={submitted || !form.agree || !form.name || !form.email}
            style={{ width: '100%' }}
          >
            {submitted ? 'Submitted!' : 'Submit'}
          </Button>
        </form>
      </Modal>
    </>
  );
};

//@ts-ignore
export const ModalWithFormStory: Story = {
  render: () => <ModalWithForm />
};
//@ts-ignore
export const DefaultModal: Story = {
  render: () => <DefaultModalComponent />
};
