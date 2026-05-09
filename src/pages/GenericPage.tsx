export function GenericPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm h-full flex flex-col items-center justify-center">
      <h3 className="text-2xl font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}
