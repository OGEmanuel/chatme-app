import { useMutation } from '@tanstack/react-query';
import { toast } from '../toast';

interface UsePostRequestProps<T, R> {
  mutationFn: (data: T) => Promise<R>;
  successToast?: { title: string; description: string };
  errorToast?: { title: string; description?: string };
  onSuccessCallback?: (data?: R) => void;
  onMutateCallBack?: () => void;
}

const useSendRequest = <T, R>({
  mutationFn,
  successToast,
  errorToast,
  onSuccessCallback,
  onMutateCallBack,
}: UsePostRequestProps<T, R>) => {
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn,
    onSuccess: data => {
      if (successToast)
        toast.success(successToast?.title, successToast?.description);
      onSuccessCallback && onSuccessCallback(data);
    },
    onMutate: () => {
      onMutateCallBack && onMutateCallBack();
    },
    onError: (error: any) => {
      if (error.isAxiosError && error.response) {
        const errorMessage =
          error.response.data?.message || `${errorToast?.description}`;

        if (errorToast) {
          toast.error(errorToast?.title, errorMessage);
        }
      } else {
        if (errorToast) {
          toast.error(
            errorToast?.title,
            'An unexpected error occurred. Please try again.',
          );
        }
      }
    },
  });

  return { mutate, isPending, isSuccess };
};

export default useSendRequest;
