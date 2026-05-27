export declare const InputFieldContainer: import('node_modules/styled-components/dist/types').IStyledComponentBase<
  'web',
  import('styled-components').FastOmit<
    import('react').DetailedHTMLProps<
      import('react').HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    never
  >
> &
  string;
export declare const InputField: import('node_modules/styled-components/dist/types').IStyledComponentBase<
  'web',
  import('styled-components').FastOmit<
    import('react').DetailedHTMLProps<
      import('react').InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    never
  >
> &
  string;
type LabelType = {
  placeholder?: string;
  label?: string;
};
export declare const Label: import('node_modules/styled-components/dist/types').IStyledComponentBase<
  'web',
  import('node_modules/styled-components/dist/types').Substitute<
    import('react').DetailedHTMLProps<
      import('react').LabelHTMLAttributes<HTMLLabelElement>,
      HTMLLabelElement
    >,
    LabelType
  >
> &
  string;
export {};
