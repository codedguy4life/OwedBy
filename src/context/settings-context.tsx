import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CurrencyCode, DEFAULT_CURRENCY } from "@/lib/currency";

const KEY = "@owedby/settings";

type SettingsValue = {
  defaultCurrency: CurrencyCode;
  setDefaultCurrency: (currency: CurrencyCode) => Promise<void>;
};

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [defaultCurrency, setDefaultCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((value) => {
      if (!value) return;
      try {
        const parsed = JSON.parse(value);
        if (parsed?.defaultCurrency) setDefaultCurrencyState(parsed.defaultCurrency);
      } catch {}
    });
  }, []);

  const setDefaultCurrency = async (currency: CurrencyCode) => {
    setDefaultCurrencyState(currency);
    await AsyncStorage.setItem(KEY, JSON.stringify({ defaultCurrency: currency }));
  };

  return <SettingsContext.Provider value={{ defaultCurrency, setDefaultCurrency }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}
