function AsyncButton({
  isSubmitting,
  label = 'Create',
  onClick,
  validateButtonCss,
  loadingButtonCss,
  disabled = false,
}: {
  isSubmitting: boolean;
  label?: string;
  onClick: () => Promise<void>;
  validateButtonCss?: string;
  loadingButtonCss?: string;
  disabled?: boolean;
}) {
  return (
    <div className='flex flex-row justify-between items-center'>
      {isSubmitting ? (
        <button
          type='button'
          disabled
          className={`${
            loadingButtonCss
              ? loadingButtonCss
              : `py-2 px-5 bg-primary text-primary opacity-50 rounded-xl border inline-flex items-center`
          }`}>
          <div
            className='inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-base-100 !border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite] mr-1'
            role='status'>
            <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'></span>
          </div>
          Loading...
        </button>
      ) : (
        <button
          type='button'
          onClick={onClick}
          disabled={disabled}
          className={`${
            validateButtonCss
              ? validateButtonCss
              : `grow px-5 py-2 rounded-xl bg-primary text-primary`
          }`}>
          {label}
        </button>
      )}
    </div>
  );
}

export default AsyncButton;
