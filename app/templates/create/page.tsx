import { TemplateForm } from "../components/form/template-form";
import { AdminSidebar } from "../components/admin-sidebar";

export default function CreateTemplatePage() {
    return (
        <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
                {/* Header */}
                <div className="shrink-0 px-8 pt-6 pb-6 border-b border-[#2a364d] flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Create Evaluation Template</h2>
                        <p className="text-slate-400 text-sm">
                            Define the specific capabilities and grading rubric for a new template.
                        </p>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 overflow-hidden">
                    <TemplateForm />
                </div>
            </div>
        </div>
    );
}
