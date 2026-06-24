export default function Reports() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto min-h-screen bg-[#f4f7fb]">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center mt-4 sm:mt-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1877f2]/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#1877f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-lg">
          View platform-wide revenue, salon performance, and AI usage reports. This module will be available in the next release.
        </p>
      </div>
    </div>
  );
}
