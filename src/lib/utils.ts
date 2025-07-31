import { clsx, ClassValue } from "clsx";

// Reference - https://github.com/shadcn-ui/ui/blob/main/apps/www/registry/default/lib/utils.ts
export const cn = (...inputClasses: ClassValue[]) => {
  return clsx(inputClasses);
};
