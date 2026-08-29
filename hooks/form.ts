import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from './form-contexts';
import {
  OTPField,
  RadioButton,
  SubscribeButton,
  TextField,
} from '@/components/form-components';

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    OTPField,
    RadioButton,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
