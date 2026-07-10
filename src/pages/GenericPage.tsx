import { FolderOpen } from 'lucide-react';

export function GenericPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-white border-2 border-neutral-100 rounded-3xl p-12 text-center shadow-lg h-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 -mt-10 -mr-10">
        <div className="w-40 h-40 bg-red-100 rounded-full blur-3xl opacity-50"></div>
      </div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10">
        <div className="w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-50"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="h-24 w-24 bg-gradient-to-tr from-red-100 to-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-200">
          <FolderOpen className="h-10 w-10" />
        </div>
        <h3 className="text-3xl font-extrabold text-neutral-900 mb-4 tracking-tight">{title}</h3>
        <p className="text-lg text-neutral-500 max-w-lg mx-auto leading-relaxed font-medium">
          {description}
        </p>
      </div>
      
      <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 bg-neutral-100 px-4 py-2 rounded-full border border-neutral-200 shadow-sm">
        Module Under Construction
      </div>
    </div>
  );
}
