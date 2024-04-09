function CustomPalette({ customPalette }: { customPalette?: PrismaJson.BuilderPlacePalette }) {
  /*
    Optim idea:
      - pass all color in rgb mode.
      - Create a loop to create automatically all classes
      - for text, we need to have both ex: text-on-primary & text-primary
    Custom Palette:
        "Palette": {
            "primary": "#FF71A2",
            "primaryFocus": "#FFC2D1",
            "primaryContent": "#ffffff",
            "base100": "#ffffff",
            "base200": "#fefcfa",
            "base300": "#fae4ce",
            "baseContent": "#000000",
            "info": "#f4dabe",
            "infoContent": "#000000",
            "success": "#C5F1A4",
            "successContent": "#000000",
            "warning": "#FFE768",
            "warningContent": "#000000",
            "error": "#FFC2D1",
            "errorContent": "#000000",
            "_id": "653b6e82d0c68fbc2750dfc9"
        },
    */

  return (
    <style>
      {`
          :root {
            --primary: ${customPalette?.primary || '#FF71A2'};
            --primary-50: ${(customPalette?.primary || '#FF71A2') + '60'};
            --primary-focus: ${customPalette?.primaryFocus || '#FFC2D1'};
            --primary-content: ${customPalette?.primaryContent || '#ffffff'};

            --base-100: ${customPalette?.base100 || '#ffffff'};
            --base-200: ${customPalette?.base200 || '#fefcfa'};
            --base-300: ${customPalette?.base300 || '#fae4ce'};
            --base-content: ${customPalette?.baseContent || '#000000'};
            --base-content-50: ${(customPalette?.baseContent || '#000000') + '90'};

            --info: ${customPalette?.info || '#f4dabe'};
            --info-content: ${customPalette?.infoContent || '#000000'};

            --success: ${customPalette?.success || '#C5F1A4'};
            --success-50: ${(customPalette?.success || '#C5F1A4') + '60'};
            --success-content: ${customPalette?.successContent || '#000000'};

            --warning: ${customPalette?.warning || '#FFE768'};
            --warning-content: ${customPalette?.warningContent || '#000000'};

            --error: ${customPalette?.error || '#FFC2D1'};
            --error-content: ${customPalette?.errorContent || '#000000'};
          }

          html .bg-primary {
            background-color: var(--primary);
          }

          html .bg-primary-focus {
            background-color: var(--primary-focus);
          }

          html .bg-primary-50 {
            background-color: var(--primary-50);
          }

          html .text-primary {
            color: var(--primary-content);
          }

          html .text-primary-focus {
            color: var(--primary-focus);
          }

          html .border-primary {
            border-color: var(--primary);
          }

          html .border-primary-focus {
            border-color: var(--primary-focus);
          }

          html .bg-base-100 {
            background-color: var(--base-100);
          }

          html .bg-base-200, html .hover\\:bg-base-200:hover {
            background-color: var(--base-200);
          }

          html .bg-base-300 {
            background-color: var(--base-300);
          }

          html .border-base-100 {
            border-color: var(--base-100);
          }

          html .border-base-200 {
            border-color: var(--base-200);
          }

          html .border-base-300 {
            border-color: var(--base-300);
          }

          html .text-base-content {
            color: var(--base-content);
          }

          html .text-base-content-50 {
            color: var(--base-content-50);
          }

          html .bg-info {
            background-color: var(--info);
          }

          html .text-info {
            color: var(--info-content);
          }

          html .border-info {
            border-color: var(--info);
          }

          html .bg-success {
            background-color: var(--success);
          }

          html .bg-success-50 {
            background-color: var(--success-50);
          }

          html .text-success {
            color: var(--success-content);
          }

          html .text-alone-success {
            color: var(--success);
          }

          html .border-success {
            border-color: var(--success);
          }

          html .bg-warning {
            background-color: var(--warning);
          }

          html .text-warning {
            color: var(--warning-content);
          }

          html .border-warning {
            border-color: var(--warning);
          }

          html .bg-error {
            background-color: var(--error);
          }

          html .text-error {
            color: var(--error-content);
          }

          html .text-alone-error {
            color: var(--error);
          }

          html .border-error {
            border-color: var(--error);
          }
        `}
    </style>
  );
}

export default CustomPalette;
