"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, ShieldAlert, ShieldCheck, CheckCircle, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMaintenanceContext } from "@/contexts/maintenance-context";
import { getAeroButtonClass } from "@/lib/glassmorphism-config";

interface InspectionDiagnosisModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { 
        inspectionNotes: string; 
        diagnosisOutcome: "Repairable" | "Not Repairable" | "No Fix Needed"; 
        repairParts?: Array<{ name: string; cost: number }>;
        expectedCost?: number;
        description?: string;
    }) => void;
    isLoading?: boolean;
    assetName?: string;
    assetCode?: string;
    assetCategory?: string;
    assetImage?: string;
    assetManufacturer?: string;
    assetModel?: string;
    assetSerialNumber?: string;
    enableGlassmorphism?: boolean;
}

const INSPECTION_NOTE_SHORTCUTS = [
    "Visual inspection",
    "Functional test",
    "No damage",
    "Minor wear",
    "Requires cleaning",
    "Lubrication needed",
    "All functioning",
    "Operating normally",
    "Safety verified",
    "Performance OK",
    "Calibration required",
    "Parts worn",
];

export function InspectionDiagnosisModal({ 
    open, 
    onOpenChange, 
    onSubmit, 
    isLoading, 
    assetName,
    assetCode,
    assetCategory,
    assetImage,
    assetManufacturer,
    assetModel,
    assetSerialNumber,
    enableGlassmorphism = false 
}: InspectionDiagnosisModalProps) {
    const { glassType } = useMaintenanceContext();
    
    // Helper to apply Aero button styling
    const getButtonClassName = (baseClass: string = "") => {
        if (glassType === 'aero') {
            return `${baseClass} ${getAeroButtonClass()}`.trim();
        }
        return baseClass;
    };
    
    const [inspectionNotes, setInspectionNotes] = useState("");
    const [diagnosisOutcome, setDiagnosisOutcome] = useState<"Repairable" | "Not Repairable" | "No Fix Needed" | "">("");
    
    // Repairable state
    const [repairParts, setRepairParts] = useState<Array<{ id: string; name: string; cost: number }>>([]);
    const [newPartName, setNewPartName] = useState("");
    const [newPartCost, setNewPartCost] = useState("");
    
    // Not Repairable state
    const [expectedCost, setExpectedCost] = useState("");
    const [description, setDescription] = useState("");

    const totalRepairCost = repairParts.reduce((sum, part) => sum + part.cost, 0);
    const canSubmit = inspectionNotes.trim().length > 0 && diagnosisOutcome !== "";

    const handleAddPart = () => {
        if (!newPartName.trim() || !newPartCost.trim()) {
            toast.error("Please enter part name and cost");
            return;
        }
        const cost = parseFloat(newPartCost);
        if (isNaN(cost) || cost <= 0) {
            toast.error("Please enter a valid cost");
            return;
        }
        setRepairParts([...repairParts, { id: Date.now().toString(), name: newPartName, cost }]);
        setNewPartName("");
        setNewPartCost("");
    };

    const handleRemovePart = (id: string) => {
        setRepairParts(repairParts.filter(p => p.id !== id));
    };

    const handleSubmit = () => {
        if (!canSubmit) return;

        if (diagnosisOutcome === "Repairable" && repairParts.length === 0) {
            toast.error("Please add at least one repair part");
            return;
        }

        if (diagnosisOutcome === "Not Repairable" && !expectedCost.trim()) {
            toast.error("Please enter expected cost");
            return;
        }

        onSubmit({ 
            inspectionNotes, 
            diagnosisOutcome: diagnosisOutcome as "Repairable" | "Not Repairable" | "No Fix Needed",
            repairParts: diagnosisOutcome === "Repairable" ? repairParts : undefined,
            expectedCost: diagnosisOutcome === "Not Repairable" ? parseFloat(expectedCost) : undefined,
            description: diagnosisOutcome === "Not Repairable" ? description : undefined,
        });
    };

    const handleClose = (v: boolean) => {
        if (!v) {
            setInspectionNotes("");
            setDiagnosisOutcome("");
            setRepairParts([]);
            setNewPartName("");
            setNewPartCost("");
            setExpectedCost("");
            setDescription("");
        }
        onOpenChange(v);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={`sm:max-w-2xl ${
                enableGlassmorphism ? 'border border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-2xl ring-1 ring-white/10' : ''
            }`}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-primary" />
                        Inspection & Diagnosis
                    </DialogTitle>
                    <DialogDescription>
                        {assetName ? `Inspecting: ${assetName}` : "Fill in the inspection details below."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2 flex-1 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-2">
                        <Label htmlFor="inspection-notes">Inspection Notes <span className="text-destructive">*</span></Label>
                        <div className="space-y-3">
                            {/* Shortcut chips */}
                            <div className="p-3 rounded-lg border bg-muted/30">
                                <p className="text-xs text-muted-foreground mb-2">Click to add shortcuts:</p>
                                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2">
                                    {INSPECTION_NOTE_SHORTCUTS.map((shortcut, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => {
                                                const newText = inspectionNotes 
                                                    ? `${inspectionNotes}${inspectionNotes.endsWith('.') || inspectionNotes.endsWith(',') ? ' ' : '. '}${shortcut}`
                                                    : shortcut;
                                                setInspectionNotes(newText);
                                            }}
                                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-background border border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                                        >
                                            {shortcut}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Textarea
                                id="inspection-notes"
                                placeholder="Click shortcuts above or type custom inspection notes..."
                                value={inspectionNotes}
                                onChange={(e) => setInspectionNotes(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Asset Details Display */}
                    {(assetName || assetCode || assetCategory || assetImage || assetManufacturer || assetModel || assetSerialNumber) && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Asset Details</p>
                            
                            <div className="grid grid-cols-3 gap-4">
                                {/* Asset Image */}
                                {assetImage && (
                                    <div className="col-span-1">
                                        <div className="aspect-square rounded-lg bg-background border border-border overflow-hidden flex items-center justify-center">
                                            <img 
                                                src={assetImage} 
                                                alt={assetName || "Asset"} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Asset Info */}
                                <div className={assetImage ? "col-span-2" : "col-span-3"}>
                                    <div className="space-y-3">
                                        {assetName && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground">Asset Name</p>
                                                <p className="text-sm font-medium">{assetName}</p>
                                            </div>
                                        )}
                                        {assetCode && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground">Asset Code</p>
                                                <p className="text-xs text-foreground font-mono bg-background/50 px-2 py-1 rounded">{assetCode}</p>
                                            </div>
                                        )}
                                        {assetCategory && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground">Category</p>
                                                <p className="text-xs text-foreground">{assetCategory}</p>
                                            </div>
                                        )}
                                        {assetManufacturer && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground">Manufacturer</p>
                                                <p className="text-xs text-foreground">{assetManufacturer}</p>
                                            </div>
                                        )}
                                        {assetModel && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground">Model</p>
                                                <p className="text-xs text-foreground">{assetModel}</p>
                                            </div>
                                        )}
                                        {assetSerialNumber && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground">Serial Number</p>
                                                <p className="text-xs text-foreground font-mono bg-background/50 px-2 py-1 rounded">{assetSerialNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Label>Diagnosis Outcome <span className="text-destructive">*</span></Label>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setDiagnosisOutcome("Repairable");
                                    setInspectionNotes("");
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left ${
                                    diagnosisOutcome === "Repairable"
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                                        : "border-border hover:bg-muted/50"
                                }`}
                            >
                                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    diagnosisOutcome === "Repairable" ? "border-emerald-500" : "border-muted-foreground/40"
                                }`}>
                                    {diagnosisOutcome === "Repairable" && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                                </div>
                                <ShieldCheck className={`h-5 w-5 shrink-0 ${diagnosisOutcome === "Repairable" ? "text-emerald-600" : "text-muted-foreground"}`} />
                                <div>
                                    <p className="text-sm font-medium">Repairable</p>
                                    <p className="text-xs text-muted-foreground">Asset can be repaired, add parts needed</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDiagnosisOutcome("Not Repairable");
                                    setInspectionNotes("");
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left ${
                                    diagnosisOutcome === "Not Repairable"
                                        ? "border-red-500 bg-red-50 dark:bg-red-950/30 ring-1 ring-red-500"
                                        : "border-border hover:bg-muted/50"
                                }`}
                            >
                                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    diagnosisOutcome === "Not Repairable" ? "border-red-500" : "border-muted-foreground/40"
                                }`}>
                                    {diagnosisOutcome === "Not Repairable" && <div className="h-2 w-2 rounded-full bg-red-500" />}
                                </div>
                                <ShieldAlert className={`h-5 w-5 shrink-0 ${diagnosisOutcome === "Not Repairable" ? "text-red-600" : "text-muted-foreground"}`} />
                                <div>
                                    <p className="text-sm font-medium">Not Repairable</p>
                                    <p className="text-xs text-muted-foreground">Asset is beyond repair, needs replacement</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDiagnosisOutcome("No Fix Needed");
                                    setInspectionNotes("There is no damage for the asset.");
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left ${
                                    diagnosisOutcome === "No Fix Needed"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500"
                                        : "border-border hover:bg-muted/50"
                                }`}
                            >
                                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    diagnosisOutcome === "No Fix Needed" ? "border-blue-500" : "border-muted-foreground/40"
                                }`}>
                                    {diagnosisOutcome === "No Fix Needed" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                </div>
                                <CheckCircle className={`h-5 w-5 shrink-0 ${diagnosisOutcome === "No Fix Needed" ? "text-blue-600" : "text-muted-foreground"}`} />
                                <div>
                                    <p className="text-sm font-medium">No Fix Needed</p>
                                    <p className="text-xs text-muted-foreground">Asset is in good condition, no repairs required</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Repairable - Repair Parts Section */}
                    {diagnosisOutcome === "Repairable" && (
                        <div className="space-y-3 p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                            <p className="text-sm font-semibold text-foreground">Repair Requirements</p>
                            
                            {/* Parts List */}
                            <div className="space-y-2">
                                {repairParts.length > 0 && (
                                    <div className="space-y-2">
                                        {repairParts.map((part) => (
                                            <div key={part.id} className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/50">
                                                <div>
                                                    <p className="text-sm font-medium">{part.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">₱{part.cost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className={getButtonClassName("h-8 w-8 text-destructive hover:bg-destructive/10")}
                                                    onClick={() => handleRemovePart(part.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Part Form */}
                                <div className="space-y-2 pt-2 border-t border-border">
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            placeholder="Part name"
                                            value={newPartName}
                                            onChange={(e) => setNewPartName(e.target.value)}
                                            className="h-9 text-sm col-span-2"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Cost"
                                            value={newPartCost}
                                            onChange={(e) => setNewPartCost(e.target.value)}
                                            step="0.01"
                                            min="0"
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={getButtonClassName("w-full h-9")}
                                        onClick={handleAddPart}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add Part
                                    </Button>
                                </div>
                            </div>

                            {/* Total Cost */}
                            {repairParts.length > 0 && (
                                <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-foreground">Total Estimated Cost:</p>
                                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₱{totalRepairCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Not Repairable - Cost & Description Section */}
                    {diagnosisOutcome === "Not Repairable" && (
                        <div className="space-y-3 p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm font-semibold text-foreground">Replacement Details</p>
                            
                            <div className="space-y-2">
                                <Label className="text-xs">Expected Replacement Cost <span className="text-destructive">*</span></Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={expectedCost}
                                    onChange={(e) => setExpectedCost(e.target.value)}
                                    step="0.01"
                                    min="0"
                                    className="h-10 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs">Notes (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="There is no damage for the asset"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="text-sm"
                                />
                            </div>

                            {expectedCost && (
                                <div className="pt-3 border-t border-red-200 dark:border-red-800">
                                    <p className="text-xs text-muted-foreground">Estimated Cost:</p>
                                    <p className="text-lg font-bold text-red-600 dark:text-red-400">₱{parseFloat(expectedCost).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" className={getButtonClassName()} onClick={() => handleClose(false)} disabled={isLoading}>Cancel</Button>
                    <Button className={getButtonClassName()} onClick={handleSubmit} disabled={!canSubmit || isLoading}>
                        {isLoading ? "Saving..." : diagnosisOutcome === "Repairable" ? "Send to Finance for Approval" : diagnosisOutcome === "Not Repairable" ? "Submit for Replacement" : "Complete Inspection"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
