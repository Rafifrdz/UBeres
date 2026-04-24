export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-50 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex gap-2 mb-3">
            <div className="w-16 h-6 bg-[#6366f2]/5 rounded-full" />
            <div className="w-20 h-4 bg-[#6366f2]/5 rounded-full mt-1" />
          </div>
          <div className="w-3/4 h-5 bg-[#6366f2]/10 rounded-lg" />
        </div>
        <div className="w-12 h-12 rounded-full bg-[#6366f2]/5" />
      </div>
      <div className="space-y-2 mb-5">
        <div className="w-full h-4 bg-[#6366f2]/5 rounded" />
        <div className="w-2/3 h-4 bg-[#6366f2]/5 rounded" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="w-24 h-8 bg-[#6366f2]/10 rounded-full" />
          <div className="w-16 h-6 bg-[#6366f2]/5 rounded-full mt-1" />
        </div>
        <div className="w-10 h-6 bg-[#6366f2]/5 rounded-full" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-[#6366f2]/5 w-full" />
      <div className="px-6 -mt-12">
        <div className="w-24 h-24 rounded-full border-4 border-white bg-[#6366f2]/10 mb-4" />
        <div className="w-48 h-8 bg-[#6366f2]/10 rounded-lg mb-2" />
        <div className="w-32 h-4 bg-[#6366f2]/5 rounded-lg" />
      </div>
    </div>
  );
}
