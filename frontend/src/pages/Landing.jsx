export default function Landing() {
  return (
    <div className="App flex items-center justify-center bg-background h-screen md:py-5">
      <div className="bg-white rounded-2xl shadow-lg w-full  sm:w-[90%] h-full flex flex-col">
        {/* Header */}
        <div className="bg-secondary px-6 py-4 rounded-t-2xl">
          <h1 className="text-xl font-bold text-center bg-gradient-to-br from-primary via-purple-500 to-primary-50 text-transparent bg-clip-text">
            ShadeRoom
          </h1>
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center justify-center">
          <a
            className="text-md text-text-tertiary bg-primary opacity-50 hover:opacity-100 px-6 py-2 rounded-md font-semibold transition"
            href="/journey"
            rel="noopener noreferrer"
          >
            Start Journey
          </a>
        </div>
      </div>
    </div>
  );
}
