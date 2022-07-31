import React, { useMemo } from "react";
import { FieldMap, CellMap } from "../types";

export const CustomConfigContext = React.createContext<{
  customCells: CellMap | undefined;
  customFields: FieldMap | undefined;
}>({
  customCells: undefined,
  customFields: undefined,
});

interface ConfigProviderProps {
  children: React.ReactNode;
  customFields?: FieldMap;
  customCells?: CellMap;
}

const ConfigProvider = ({
  children,
  customFields,
  customCells,
}: ConfigProviderProps) => {
  const value = useMemo(() => {
    return {
      customFields,
      customCells,
    };
  }, [customFields, customCells]);
  return (
    <CustomConfigContext.Provider value={value}>
      {children}
    </CustomConfigContext.Provider>
  );
};

export default ConfigProvider;
