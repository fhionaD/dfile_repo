"use client";

import { createContext, useContext } from "react";
import { useMaintenanceSettings as useSettingsHook, MaintenanceSettings } from "@/hooks/use-maintenance-settings";
import { GlassType, GlassmorphismConfig } from "@/lib/glassmorphism-config";

interface MaintenanceContextType {
    enableAnimations: boolean;
    enableGlint: boolean;
    enableGlassmorphism: boolean;
    enableMinimalUI: boolean;
    enableDataCaching: boolean;
    enableBatchOperations: boolean;
    glassType: GlassType;
    glassCustomConfig?: GlassmorphismConfig;
    isSaving: boolean;
    updateSetting: (key: keyof MaintenanceSettings, value: boolean | string | GlassmorphismConfig | undefined) => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | null>(null);

export function MaintenanceSettingsProvider({ children }: { children: React.ReactNode }) {
    const { settings, isSaving, updateSetting } = useSettingsHook();

    const value: MaintenanceContextType = {
        enableAnimations: settings.enableAnimations,
        enableGlint: settings.enableGlint,
        enableGlassmorphism: settings.enableGlassmorphism,
        enableMinimalUI: settings.enableMinimalUI,
        enableDataCaching: settings.enableDataCaching,
        enableBatchOperations: settings.enableBatchOperations,
        glassType: settings.glassType,
        glassCustomConfig: settings.glassCustomConfig,
        isSaving,
        updateSetting,
    };

    return (
        <MaintenanceContext.Provider value={value}>
            {children}
        </MaintenanceContext.Provider>
    );
}

export function useMaintenanceContext() {
    const context = useContext(MaintenanceContext);
    if (!context) {
        throw new Error("useMaintenanceContext must be used within MaintenanceSettingsProvider");
    }
    return context;
}
