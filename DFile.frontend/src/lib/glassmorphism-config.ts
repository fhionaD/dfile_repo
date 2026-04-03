export type GlassType = 'default' | 'crystalized' | 'liquid' | 'aero' | 'custom';

export interface GlassmorphismConfig {
    type: GlassType;
    opacity: number;
    blur: number; // in pixels
    borderOpacity: number;
    shadowIntensity: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    isGradient?: boolean;
}

export interface GlassmorphismCustom extends GlassmorphismConfig {
    type: 'custom';
}

// Blur intensity levels for reference
export const BLUR_LEVELS = {
    light: 8,
    normal: 12,
    medium: 20,
    heavy: 28,
    ultra: 36,
};

export const SHADOW_INTENSITY_CLASSES: Record<string, string> = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
};

export const GLASSMORPHISM_PRESETS: Record<Exclude<GlassType, 'custom'>, GlassmorphismConfig> = {
    default: {
        type: 'default',
        opacity: 0.1,
        blur: 24,
        borderOpacity: 0.2,
        shadowIntensity: 'lg',
    },
    crystalized: {
        type: 'crystalized',
        opacity: 0.15,
        blur: 36,
        borderOpacity: 0.3,
        shadowIntensity: '2xl',
    },
    liquid: {
        type: 'liquid',
        opacity: 0.06,
        blur: 8,
        borderOpacity: 0.08,
        shadowIntensity: 'sm',
        isGradient: true,
    },
    aero: {
        type: 'aero',
        opacity: 0.18,
        blur: 32,
        borderOpacity: 0.35,
        shadowIntensity: '2xl',
        isGradient: true,
    },
};

export const GLASS_TYPE_DESCRIPTIONS: Record<Exclude<GlassType, 'custom'>, string> = {
    default: 'Clean and minimal glassmorphism effect',
    crystalized: 'Sharp, crystalline appearance with higher opacity',
    liquid: 'Smooth iOS-style liquid glass with gradient',
    aero: 'Windows 7 Aero-inspired frosted glass with heavy blur',
};

export function generateGlassmorphismClass(config: GlassmorphismConfig): string {
    const opacityPercent = Math.round(config.opacity * 100);
    const borderColor = `border border-white/${Math.round(config.borderOpacity * 100)}`;
    const bgColor = `bg-white/${opacityPercent} dark:bg-black/${opacityPercent}`;
    const shadowClass = SHADOW_INTENSITY_CLASSES[config.shadowIntensity];
    const blurClass = `backdrop-blur-[${config.blur}px]`;
    
    return `${blurClass} ${borderColor} ${bgColor} ${shadowClass} ring-1 ring-white/10`;
}

export function generateGlassmorphismStyle(config: GlassmorphismConfig): React.CSSProperties {
    return {
        backdropFilter: `blur(${config.blur}px)`,
        WebkitBackdropFilter: `blur(${config.blur}px)`,
        backgroundColor: `rgba(255, 255, 255, ${config.opacity})`,
    };
}

export function getGlassmorphismPresetOrCustom(glassType: GlassType, customConfig?: GlassmorphismConfig): GlassmorphismConfig {
    if (glassType === 'custom') {
        // If custom but no config, return default custom config
        return customConfig || {
            type: 'custom',
            opacity: 0.12,
            blur: 24,
            borderOpacity: 0.2,
            shadowIntensity: 'lg',
        };
    }
    return GLASSMORPHISM_PRESETS[glassType as Exclude<GlassType, 'custom'>];
}

export function getAeroButtonClass(): string {
    return 'hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:border-primary/50 hover:bg-primary/5 hover:text-foreground dark:hover:text-white transition-all duration-200';
}
