import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import heroImage from "../../assets/images/hero.jpg";

function Hero() {
  return (
    <section
      id="home"
      className="bg-gradient-to-b from-white to-cyan-50 py-16 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}

          <div>

            {/* Badge */}

            <div className="inline-flex items-center gap-2 bg-cyan-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-8">

              <Sparkles size={16} />

              AI-powered helper matching

            </div>

            {/* Heading */}

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-slate-900">

              Accessible mobility,

              <span className="text-teal-600">

                {" "}with a human touch.

              </span>

            </h1>

            {/* Description */}

            <p className="mt-8 text-lg text-gray-600 leading-8 max-w-xl">

              CareRide AI connects elderly riders,
              people with disabilities, and patients
              with verified helpers using AI to match
              you with the right companion every time.

            </p>

            {/* Buttons */}

            <div className="flex flex-wrap gap-5 mt-10">

              <Link
                to="/register?role=rider"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-semibold transition"
              >
                I need a ride
              </Link>

              <Link
                to="/register?role=helper"
                className="bg-white border border-gray-300 hover:border-teal-600 hover:text-teal-600 px-8 py-4 rounded-xl font-semibold transition"
              >
                I want to help
              </Link>

            </div>

            {/* Stats */}

            <div className="grid grid-cols-3 gap-8 border-t mt-12 pt-8">

              <div>

                <p className="text-gray-500 text-sm">

                  Verified Helpers

                </p>

                <h3 className="text-3xl font-bold mt-1">

                  1,200+

                </h3>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  Cities

                </p>

                <h3 className="text-3xl font-bold mt-1">

                  48

                </h3>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  Avg. Rating

                </p>

                <h3 className="text-3xl font-bold mt-1">

                  4.9★

                </h3>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="relative">

            <div className="bg-white rounded-[36px] shadow-2xl overflow-hidden">

              <img
                src={heroImage}
                alt="CareRide Hero"
                className="w-full h-[520px] object-cover"
              />

            </div>

            {/* Shadow Card */}

            <div className="absolute -bottom-5 left-6 right-6 h-10 bg-cyan-100 rounded-full blur-2xl opacity-70"></div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;