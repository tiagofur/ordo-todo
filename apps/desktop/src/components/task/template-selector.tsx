import { useState } from "react";
import { Check, ChevronsUpDown, LayoutTemplate, Settings } from "lucide-react";
import {
  cn,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ordo-todo/ui";
import { useTemplates, TaskTemplate } from "@/hooks/api/use-templates";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { TemplateManagerDialog } from "@/components/templates/template-manager-dialog";

interface TemplateSelectorProps {
  onSelect: (template: TaskTemplate) => void;
  selectedTemplateId?: string;
}

export function TemplateSelector({ onSelect, selectedTemplateId }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const { selectedWorkspaceId } = useWorkspaceStore();
  
  const { data: templates } = useTemplates(selectedWorkspaceId || undefined);

  // If no templates, show just the button to create/manage?
  // Or still show selector but with "No templates found" + Manage

  const selectedTemplate = templates?.find((t: any) => t.id === selectedTemplateId);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            title="Usar una plantilla"
          >
            <div className="flex items-center gap-2 truncate">
              <LayoutTemplate className="h-4 w-4 shrink-0 opacity-50" />
              {selectedTemplate ? selectedTemplate.name : "Aplicar plantilla..."}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Buscar plantilla..." />
            <CommandList>
              <CommandEmpty>No se encontraron plantillas.</CommandEmpty>
              <CommandGroup heading="Plantillas disponibles">
                {templates?.map((template: any) => (
                  <CommandItem
                    key={template.id}
                    value={template.name}
                    onSelect={() => {
                      onSelect(template);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTemplateId === template.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{template.name}</span>
                      {template.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={() => { setShowManager(true); setOpen(false); }}>
                    <Settings className="mr-2 h-4 w-4" />
                    Gestionar Plantillas...
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <TemplateManagerDialog open={showManager} onOpenChange={setShowManager} />
    </>
  );
}
