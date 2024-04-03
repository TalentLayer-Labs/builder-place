function RemoveButton({
  isSubmitting,
  label = 'Remove',
  loadingLabel = 'Removing...',
  onClick,
  index,
}: {
  isSubmitting: boolean | string;
  label?: string;
  loadingLabel?: string;
  onClick?: () => void | Promise<void>;
  index?: string;
}) {
  const submitting = index ? isSubmitting === index : !!isSubmitting;

  return (
    <div className='flex flex-row justify-between items-center'>
      {submitting ? (
        <button
          disabled
          type='submit'
          className='px-4 py-2 bg-red-500 opacity-50 text-white rounded hover:bg-red-600 focus:outline-none'>
          <div
            className='inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-base-100 !border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite] mr-1'
            role='status'>
            <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'></span>
          </div>
          {loadingLabel}
        </button>
      ) : (
        <button
          type='submit'
          onClick={onClick}
          disabled={!!isSubmitting}
          className={`${
            !!isSubmitting && `opacity-50`
          } px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none`}>
          {label}
        </button>
      )}
    </div>
  );
}

export default RemoveButton;
