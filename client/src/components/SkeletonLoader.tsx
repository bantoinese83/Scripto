
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg shadow-md p-4 aspect-square">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-300 rounded"></div> {/* Code2 icon placeholder */}
          <div className="w-24 h-6 bg-gray-300 rounded"></div> {/* Title placeholder */}
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 bg-gray-300 rounded"></div> {/* Clipboard icon placeholder */}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 bg-gray-300 rounded"></div>  {/* Language placeholder */}
          <div className="w-16 h-4 bg-gray-300 rounded"></div> {/* Language value placeholder */}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 bg-gray-300 rounded"></div> {/* Category placeholder */}
          <div className="w-20 h-4 bg-gray-300 rounded"></div> {/* Category value placeholder */}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 bg-gray-300 rounded"></div> {/* Tags placeholder */}
          <div className="w-32 h-4 bg-gray-300 rounded"></div> {/* Tags value placeholder */}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-300 rounded"></div> {/* CheckCircle placeholder */}
          <div className="w-16 h-4 bg-gray-300 rounded"></div> {/* Deploy placeholder */}
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonLoader;