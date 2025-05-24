import { useEffect, useState } from 'react';

export default function ClientOnlyPhoneInput({
  value,
  onChange,
  placeholder,
}: any) {
  const [PhoneInput, setPhoneInput] = useState<any>(null);

  useEffect(() => {
    import('react-phone-input-2').then((module) => {
      setPhoneInput(() => module.default);
    });
  }, []);

  if (!PhoneInput) return null;

  return (
    <PhoneInput
      country={'la'}
      enableAreaCodes
      autocompleteSearch
      enableSearch
      placeholder={placeholder}
      searchPlaceholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}
