import { ArrowRight, HeartHandshake, Star } from "lucide-react";
import heroImage from "../../assets/images/hero.jpg";

function Hero() {
  return (
    <section className="bg-gradient-to-b from-[#F8FAF8] to-[#EAF8F7]">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HeartHandshake size={16} />
              AI-powered helper matching
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-slate-900 mb-6">
              Accessible mobility,
              <span className="text-teal-600"> with a human touch.</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-xl">
              CareRide connects elderly riders, people with disabilities,
              and patients with verified helpers — and uses AI to match you
              with the right one, every time.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition">
                I need a ride
                <ArrowRight size={18} />
              </button>

              <button className="bg-white border border-slate-300 hover:bg-slate-100 px-6 py-3 rounded-xl font-semibold transition">
                I want to help
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-slate-200 pt-6">
              <div>
                <p className="text-sm text-slate-500">Verified Helpers</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  1,200+
                </h3>
              </div>

              <div>
                <p className="text-sm text-slate-500">Cities</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  48
                </h3>
              </div>

              <div>
                <p className="text-sm text-slate-500">Avg. Rating</p>
                <h3 className="text-3xl font-bold text-slate-900 flex items-center gap-1">
                  4.9
                  <Star
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                </h3>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-teal-300 rounded-3xl blur-3xl opacity-20"></div>

            <img
              src={heroImage}
              alt="CareRide"
              className="relative rounded-3xl shadow-2xl w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;