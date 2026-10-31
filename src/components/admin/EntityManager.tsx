import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

export type EntityType = "projects" | "skills" | "caseStudies" | "blogs";
export type FormPrimitive = string | number | boolean | null | undefined;
export type FormRecord = Record<string, FormPrimitive>;
export type AdminItem = FormRecord & { id: number };

type Field = {
  name: string;
  label: string;
  kind: "text" | "textarea" | "number" | "switch" | "select" | "url";
  required?: boolean;
  full?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: { label: string; value: string | number }[];
  nullable?: boolean;
};

export type EntityConfig = {
  entity: EntityType;
  title: string;
  singular: string;
  description: string;
  defaults: FormRecord;
  fields: Field[];
  secondary: (item: AdminItem) => string;
};

type Props = {
  config: EntityConfig;
  rows: AdminItem[];
  saving: boolean;
  onSave: (entity: EntityType, value: FormRecord) => Promise<unknown>;
  onDelete: (entity: EntityType, id: number) => Promise<unknown>;
  headerAction?: ReactNode;
};

export function EntityManager({ config, rows, saving, onSave, onDelete, headerAction }: Props) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminItem | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminItem | null>(null);
  const [form, setForm] = useState<FormRecord>(config.defaults);
  const filtered = useMemo(() => rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query]);

  const openEditor = (item: AdminItem | "new") => {
    setForm(item === "new" ? { ...config.defaults } : { ...config.defaults, ...item });
    setEditing(item);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await onSave(config.entity, form);
      setEditing(null);
    } catch {
      // The mutation displays the server validation message.
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await onDelete(config.entity, deleting.id);
      setDeleting(null);
    } catch {
      // The mutation displays the error.
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div><p className="admin-kicker">CONTENT COLLECTION</p><h1>{config.title}</h1><p>{config.description}</p></div>
        <div className="admin-heading-actions">{headerAction}<button className="admin-primary-button" onClick={() => openEditor("new")}><Plus size={17} />Add {config.singular}</button></div>
      </div>
      <div className="admin-toolbar">
        <label className="admin-search"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}…`} aria-label={`Search ${config.title}`} /></label>
        <span>{filtered.length} of {rows.length} entries</span>
      </div>
      <div className="admin-table-wrap">
        <div className="admin-table-head"><span>Entry</span><span>Details</span><span>Status</span><span>Actions</span></div>
        {filtered.length === 0 ? (
          <div className="admin-empty"><Search size={26} /><h3>{rows.length ? "No matching entries" : `No ${config.title.toLowerCase()} yet`}</h3><p>{rows.length ? "Try a different search term." : `Add your first ${config.singular} to start building the portfolio.`}</p>{!rows.length && <button onClick={() => openEditor("new")}><Plus size={16} />Add {config.singular}</button>}</div>
        ) : filtered.map(row => (
          <div className="admin-table-row" key={row.id}>
            <div className="admin-entry-title"><strong>{String(row.title ?? row.name ?? "Untitled")}</strong><span>#{row.id}</span></div>
            <p>{config.secondary(row)}</p>
            <div className="admin-statuses"><span className={row.published ? "status-published" : "status-draft"}>{row.published ? "Published" : "Draft"}</span>{Boolean(row.featured) && <span className="status-featured">Featured</span>}</div>
            <div className="admin-row-actions"><button onClick={() => openEditor(row)} aria-label={`Edit ${String(row.title ?? row.name)}`}><Edit3 size={16} /></button><button className="danger-action" onClick={() => setDeleting(row)} aria-label={`Delete ${String(row.title ?? row.name)}`}><Trash2 size={16} /></button></div>
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="admin-form-dialog">
          <DialogHeader><DialogTitle>{editing === "new" ? `Add ${config.singular}` : `Edit ${config.singular}`}</DialogTitle><DialogDescription>Fields marked with an asterisk are required. Changes appear on the public portfolio after saving.</DialogDescription></DialogHeader>
          <form onSubmit={submit} className="admin-entity-form">
            <div className="admin-form-grid">
              {config.fields.map(field => (
                <label className={`admin-field ${field.full || field.kind === "textarea" || field.kind === "switch" ? "field-full" : ""}`} key={field.name}>
                  <span>{field.label}{field.required && " *"}</span>
                  {field.kind === "textarea" ? (
                    <textarea required={field.required} rows={5} value={String(form[field.name] ?? "")} placeholder={field.placeholder} onChange={event => setForm(current => ({ ...current, [field.name]: event.target.value }))} />
                  ) : field.kind === "switch" ? (
                    <span className="admin-switch-row"><Switch checked={Boolean(form[field.name])} onCheckedChange={checked => setForm(current => ({ ...current, [field.name]: checked }))} /><small>{form[field.name] ? "Enabled" : "Disabled"}</small></span>
                  ) : field.kind === "select" ? (
                    <select required={field.required} value={String(form[field.name] ?? "")} onChange={event => setForm(current => ({ ...current, [field.name]: field.nullable && !event.target.value ? null : field.options?.some(option => typeof option.value === "number") ? Number(event.target.value) : event.target.value }))}>
                      {field.nullable && <option value="">No linked project</option>}
                      {field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : (
                    <input type={field.kind === "number" ? "number" : field.kind === "url" ? "url" : "text"} required={field.required} min={field.min} max={field.max} value={String(form[field.name] ?? "")} placeholder={field.placeholder} onChange={event => setForm(current => ({ ...current, [field.name]: field.kind === "number" ? Number(event.target.value) : event.target.value }))} />
                  )}
                  {field.kind === "url" && <small>Full https:// URL, or leave empty.</small>}
                </label>
              ))}
            </div>
            <div className="admin-form-actions"><button type="button" onClick={() => setEditing(null)}>Cancel</button><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : `Save ${config.singular}`}</button></div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}>
        <AlertDialogContent className="admin-delete-dialog">
          <AlertDialogHeader><AlertDialogTitle>Delete this {config.singular}?</AlertDialogTitle><AlertDialogDescription>“{String(deleting?.title ?? deleting?.name ?? "This entry")}” will be permanently removed. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="delete-confirm" onClick={event => { event.preventDefault(); void remove(); }}>Delete permanently</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
