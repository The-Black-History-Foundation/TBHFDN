import { NCS_VEHICLE_DONATION_URL } from "@/lib/vehicle-donation";

const DonateVehicleSection = () => {
  return (
    <section
      id="donate-vehicle"
      className="py-12 md:py-16 bg-[var(--bg-secondary)]"
      aria-labelledby="donate-vehicle-heading"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
          <h2
            id="donate-vehicle-heading"
            className="font-neue-kabel font-bold text-2xl mb-3 text-[var(--text-primary)]"
          >
            Donate a vehicle
          </h2>
          <p className="font-helvetica text-[var(--text-secondary)] mb-6">
            Vehicle donations are handled by our partner NCS Vehicle Donations.
          </p>
          <a
            href={NCS_VEHICLE_DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-[var(--primary)] text-white px-6 py-3 rounded-md hover:bg-[var(--primary-dark)] transition-colors font-helvetica font-medium"
          >
            Donate a vehicle
          </a>
        </div>
      </div>
    </section>
  );
};

export default DonateVehicleSection;