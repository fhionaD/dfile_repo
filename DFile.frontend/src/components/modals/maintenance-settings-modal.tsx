"use client";

import { useCallback, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, AlertTriangle, Zap, Database, Boxes, Sparkles, ChevronDown } from "lucide-react";
import { MaintenanceSettings } from "@/hooks/use-maintenance-settings";
import { useMaintenanceContext } from "@/contexts/maintenance-context";
import { GLASSMORPHISM_PRESETS, GLASS_TYPE_DESCRIPTIONS, GlassType, SHADOW_INTENSITY_CLASSES } from "@/lib/glassmorphism-config";
import { toast } from "sonner";

interface MaintenanceSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MaintenanceSettingsModal({ open, onOpenChange }: MaintenanceSettingsModalProps) {
    const { enableAnimations, enableGlint, enableGlassmorphism, enableMinimalUI, enableDataCaching, enableBatchOperations, glassType, glassCustomConfig, updateSetting, isSaving } = useMaintenanceContext();
    const [showCustomization, setShowCustomization] = useState(false);
    
    // Default custom glass config
    const defaultCustomConfig = {
        type: 'custom' as const,
        opacity: 0.12,
        blur: 24,
        borderOpacity: 0.2,
        shadowIntensity: 'lg' as const,
    };
    
    // Custom glass config state - always has a valid value
    const [customConfig, setCustomConfig] = useState(glassCustomConfig || defaultCustomConfig);
    
    // Update customConfig when glassCustomConfig from context changes
    useEffect(() => {
        if (glassCustomConfig) {
            setCustomConfig(glassCustomConfig);
        }
    }, [glassCustomConfig]);
    
    const settings = {
        enableAnimations,
        enableGlint,
        enableGlassmorphism,
        enableMinimalUI,
        enableDataCaching,
        enableBatchOperations,
    };

    const handleCustomConfigChange = useCallback((key: string, value: number | string | boolean) => {
        const updated = { ...customConfig, [key]: value };
        setCustomConfig(updated as any);
        updateSetting('glassCustomConfig', updated as any);
        toast.success('Glass settings updated');
    }, [customConfig, updateSetting]);

    const handleSettingChange = useCallback((settingName: string, key: string) => {
        const typedKey = key as keyof Omit<MaintenanceSettings, 'glassType'>;
        const newValue = !(settings as any)[typedKey];
        updateSetting(typedKey, newValue);
        toast.success('Setting saved successfully', {
            description: `${settingName} has been ${newValue ? 'enabled' : 'disabled'}`,
            duration: 2000,
        });
    }, [settings, updateSetting]);

    const handleGlassTypeChange = useCallback((newType: GlassType) => {
        updateSetting('glassType', newType);
        if (newType !== 'custom') {
            const desc = GLASS_TYPE_DESCRIPTIONS[newType];
            toast.success('Glass Type Changed', {
                description: desc,
                duration: 2000,
            });
        } else {
            toast.success('Switched to Custom', {
                description: 'Adjust sliders to customize your glass effect',
                duration: 2000,
            });
        }
    }, [updateSetting]);

    const handleGlassmorphismChange = useCallback(() => {
        const newValue = !enableGlassmorphism;
        updateSetting('enableGlassmorphism', newValue);
        
        if (newValue) {
            toast.warning('Performance Notice', {
                description: 'Glassmorphism effect increases CPU/GPU usage. Disable if experiencing performance issues.',
                duration: 4000,
            });
        } else {
            toast.success('Setting saved successfully', {
                description: 'Glassmorphism Effect has been disabled',
                duration: 2000,
            });
        }
    }, [enableGlassmorphism, updateSetting]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl rounded-2xl border-border p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-6 bg-muted/40 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                            <Settings size={20} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">Maintenance Settings</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-1">
                                Global settings applied to all maintenance pages
                            </DialogDescription>
                        </div>
                        {isSaving && (
                            <Badge variant="secondary" className="ml-auto animate-pulse">
                                Syncing...
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {/* Display Settings Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Display Settings</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Tab Animations */}
                            <div className="flex flex-col justify-between p-4 rounded-lg border border-border transition-all duration-200 shadow-sm bg-card hover:bg-muted/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] hover:border-primary/30">
                                <div className="mb-3">
                                    <p className="text-sm font-medium">Tab Animations</p>
                                    <p className="text-xs text-muted-foreground">Enable smooth transitions between tabs</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('Tab Animations', 'enableAnimations')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                                        settings.enableAnimations ? 'bg-primary shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-muted-foreground/30'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                            settings.enableAnimations ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Completion Glint Effect */}
                            <div className="flex flex-col justify-between p-4 rounded-lg border border-border transition-all duration-200 shadow-sm bg-card hover:bg-muted/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] hover:border-primary/30">
                                <div className="mb-3">
                                    <p className="text-sm font-medium">Completion Glint Effect</p>
                                    <p className="text-xs text-muted-foreground">Show shimmer when tasks complete</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('Completion Glint Effect', 'enableGlint')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                                        settings.enableGlint ? 'bg-primary shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-muted-foreground/30'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                            settings.enableGlint ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Glassmorphism Effect */}
                            <div className="flex flex-col justify-between p-4 rounded-lg border border-border transition-all duration-200 shadow-sm bg-card hover:bg-muted/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] hover:border-primary/30">
                                <div className="mb-3">
                                    <p className="text-sm font-medium">Glassmorphism Effect</p>
                                    <p className="text-xs text-muted-foreground">Apply frosted glass to modals • ⚠️ Increases usage</p>
                                </div>
                                <button
                                    onClick={handleGlassmorphismChange}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                                        settings.enableGlassmorphism ? 'bg-primary shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-muted-foreground/30'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                            settings.enableGlassmorphism ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Glassmorphism Customization Section */}
                    {settings.enableGlassmorphism && (
                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-semibold">Glass Style Preset</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {(['default', 'crystalized', 'liquid', 'aero'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handleGlassTypeChange(type)}
                                        className={`flex flex-col p-3 rounded-lg border-2 transition-all duration-200 ${
                                            glassType === type
                                                ? 'border-primary bg-primary/10 shadow-[0_0_16px_rgba(59,130,246,0.4)]'
                                                : 'border-border bg-card hover:bg-primary/5 hover:border-primary/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold capitalize mb-1">{type}</p>
                                        <p className="text-xs text-muted-foreground text-left">{GLASS_TYPE_DESCRIPTIONS[type]}</p>
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleGlassTypeChange('custom')}
                                    className={`flex flex-col p-3 rounded-lg border-2 transition-all duration-200 ${
                                        glassType === 'custom'
                                            ? 'border-primary bg-primary/10 shadow-[0_0_16px_rgba(59,130,246,0.4)]'
                                            : 'border-border bg-card hover:bg-primary/5 hover:border-primary/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                                    }`}
                                >
                                    <p className="text-xs font-semibold capitalize mb-1">Custom</p>
                                    <p className="text-xs text-muted-foreground text-left">Create your own glass effect</p>
                                </button>
                            </div>

                            {/* Custom Glass Sliders */}
                            {glassType === 'custom' && (
                                <div className="mt-6 space-y-4 pt-4 border-t border-border">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Opacity: {customConfig?.opacity ? Math.round(customConfig.opacity * 100) : 0}%</label>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="30"
                                            step="1"
                                            value={customConfig?.opacity ? Math.round(customConfig.opacity * 100) : 0}
                                            onChange={(e) => handleCustomConfigChange('opacity', parseInt(e.target.value) / 100)}
                                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <p className="text-xs text-muted-foreground">0% to 30%</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Blur: {customConfig?.blur || 0}px</label>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step="1"
                                            value={customConfig?.blur || 0}
                                            onChange={(e) => handleCustomConfigChange('blur', parseInt(e.target.value))}
                                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <p className="text-xs text-muted-foreground">0px to 50px</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Border Opacity: {customConfig?.borderOpacity ? Math.round(customConfig.borderOpacity * 100) : 0}%</label>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step="1"
                                            value={customConfig?.borderOpacity ? Math.round(customConfig.borderOpacity * 100) : 0}
                                            onChange={(e) => handleCustomConfigChange('borderOpacity', parseInt(e.target.value) / 100)}
                                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <p className="text-xs text-muted-foreground">0% to 50%</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Shadow Intensity</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((shadow) => (
                                                <button
                                                    key={shadow}
                                                    onClick={() => handleCustomConfigChange('shadowIntensity', shadow)}
                                                    className={`py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                                                        (customConfig?.shadowIntensity || 'lg') === shadow
                                                            ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                                                            : 'bg-muted hover:bg-primary/20 hover:shadow-[0_0_8px_rgba(59,130,246,0.2)]'
                                                    }`}
                                                >
                                                    {shadow}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Optimization Settings Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Database className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Optimization Settings</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Minimal UI */}
                            <div className="flex flex-col justify-between p-4 rounded-lg border border-border transition-all shadow-sm bg-card hover:bg-muted/50">
                                <div className="mb-3">
                                    <p className="text-sm font-medium">Minimal UI</p>
                                    <p className="text-xs text-muted-foreground">Hide decorative elements for faster loading</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('Minimal UI', 'enableMinimalUI')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.enableMinimalUI ? 'bg-primary' : 'bg-muted-foreground/30'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                            settings.enableMinimalUI ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Data Caching */}
                            <div className="flex flex-col justify-between p-4 rounded-lg border border-border transition-all shadow-sm bg-card hover:bg-muted/50">
                                <div className="mb-3">
                                    <p className="text-sm font-medium">Data Caching</p>
                                    <p className="text-xs text-muted-foreground">Cache records locally for offline access</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('Data Caching', 'enableDataCaching')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.enableDataCaching ? 'bg-primary' : 'bg-muted-foreground/30'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                            settings.enableDataCaching ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Batch Operations */}
                            <div className="flex flex-col justify-between p-4 rounded-lg border border-border transition-all shadow-sm bg-card hover:bg-muted/50">
                                <div className="mb-3">
                                    <p className="text-sm font-medium">Batch Operations</p>
                                    <p className="text-xs text-muted-foreground">Group updates for improved performance</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('Batch Operations', 'enableBatchOperations')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.enableBatchOperations ? 'bg-primary' : 'bg-muted-foreground/30'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                            settings.enableBatchOperations ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700 dark:text-blue-400">
                                <p className="font-semibold mb-1">Testing Mode Active</p>
                                <p className="text-blue-600/80 dark:text-blue-400/70">These settings are in testing phase. Some features may not work as expected. Please report any issues.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-muted/40 border-t border-border shrink-0 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
