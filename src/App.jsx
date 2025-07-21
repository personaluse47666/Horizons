import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Car, Clock, MapPin, Menu, Phone, X } from 'lucide-react';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import { useToast } from './components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { DatePicker } from './components/ui/date-picker';
import { Checkbox } from './components/ui/checkbox';
import emailjs from 'emailjs-com';

const services = [
  {
    id: 1,
    name: "Full Detail",
    description: "Our Most Popular Service!",
    pricing: {
      small: 325,
      medium: 350,
      large: 375
    },
    includes: {
      exterior: [
        "Deep Clean Wheels/Tires",
        "Bug/Tar Removal",
        "Iron Decontamination",
        "Hand Wash, Clay Bar Treatment/Blow Dry",
        "Sealant/Carnauba Wax Application",
        "Tire/Black Trim Dressing"
      ],
      interior: [
        "Interior Blowout/Deep Vacuum",
        "Shampoo Seats, Carpets, Headliner/Floor Mats",
        "Scrub/Condition Doors, Plastics, Dash, Cup Holders/Center Console",
        "Odor Elimination",
        "Door, Trunk Jambs/Gas Cap Cleaning",
        "Window Cleaning (Inside/Out)"
      ]
    },
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2071&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Interior Shampoo",
    description: "Deep Clean for Your Interior",
    pricing: {
      small: 200,
      medium: 225,
      large: 250
    },
    includes: {
      interior: [
        "Interior Blowout/Deep Vacuum",
        "Shampoo Seats, Carpets, Headliner/Mats",
        "Scrub/Condition Doors, Plastics, Dash, Cup Holders/Center Console",
        "Odor Elimination",
        "Door, Trunk Jambs",
        "Window Cleaning (Inside/Out)"
      ]
    },
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Standard Detail",
    description: "Exterior-Focused Detail",
    pricing: {
      small: 216,
      medium: 233,
      large: 250
    },
    includes: {
      exterior: [
        "Deep Clean Wheels/Tires",
        "Bug/Tar Removal",
        "Iron Decontamination",
        "Hand Wash, Clay Bar Treatment/Blow Dry",
        "Sealant/Carnauba Wax Application",
        "Tire/Black Trim Dressing",
        "Door, Trunk Jambs/Gas Cap Cleaning",
        "Window Cleaning (Inside/Out)",
        "Interior Vacuum/Wipe Down"
      ]
    },
    note: "Not ideal for first-time details. For best results, start with a Full Detail",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
  }
];

const maintenancePrograms = [
  {
    id: 1,
    name: "Bi-Weekly",
    description: "Better Price Value!",
    price: "$80 every 2 weeks"
  },
  {
    id: 2,
    name: "Monthly",
    description: "",
    price: "$180 once a month"
  }
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

// Function to generate Google Calendar event link
function getGoogleCalendarUrl({ service, date, time, name, address, vehicleInfo, specialRequests }) {
  if (!date || !time) return '';
  // Combine date and time, and convert to UTC
  const start = new Date(date);
  const [hour, minute, ampm] = time.match(/(\d+):(\d+)\s*(AM|PM)/i).slice(1);
  let h = parseInt(hour, 10);
  if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
  if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
  start.setHours(h, parseInt(minute, 10), 0, 0);

  // Assume 1 hour duration
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  // Format as YYYYMMDDTHHmmssZ (UTC)
  const format = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${service} - Car Detailing for ${name}`,
    dates: `${format(start)}/${format(end)}`,
    details: `Service: ${service}\nName: ${name}\nAddress: ${address}\nVehicle: ${vehicleInfo}\nSpecial Requests: ${specialRequests || ''}`,
    location: address
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [vehicleSize, setVehicleSize] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicleInfo: "",
    specialRequests: ""
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookNow = (service) => {
    setSelectedService(service);
    setBookingOpen(true);
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !vehicleSize || !formData.name || !formData.phone || !formData.address || !agreeToTerms) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and agree to terms.",
        variant: "destructive"
      });
      return;
    }

    // Generate Google Calendar event link
    const google_calendar_link = getGoogleCalendarUrl({
      service: selectedService?.name,
      date: selectedDate,
      time: selectedTime,
      name: formData.name,
      address: formData.address,
      vehicleInfo: formData.vehicleInfo,
      specialRequests: formData.specialRequests
    });

    // Prepare booking details for EmailJS
    const booking = {
      service: selectedService?.name,
      date: selectedDate?.toLocaleDateString(),
      time: selectedTime,
      vehicleSize,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      vehicleInfo: formData.vehicleInfo,
      specialRequests: formData.specialRequests,
      google_calendar_link // Add the calendar link to the email
    };

    // Send email via EmailJS
    emailjs.send(
      'service_yvta5u5',      // Provided EmailJS service ID
      'template_d5baycn',     // Provided EmailJS template ID
      booking,                // The object with booking details
      'aWrp0d6nsF_W0h2yi'     // Provided EmailJS public key
    ).then((result) => {
      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been emailed to the owner.",
      });
    }, (error) => {
      toast({
        title: "Email Failed",
        description: "There was an error sending your booking. Please try again.",
        variant: "destructive"
      });
    });

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    localStorage.setItem('bookings', JSON.stringify([...existingBookings, booking]));
    
    // Reset form
    setBookingOpen(false);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime("");
    setVehicleSize("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      vehicleInfo: "",
      specialRequests: ""
    });
    setAgreeToTerms(false);
  };

  const calculatePrice = () => {
    if (!selectedService || !vehicleSize) return null;
    return selectedService.pricing[vehicleSize];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/efc9cf05-dae7-4dfe-a9b2-fa36965cab51/182d8f5d2eafcb105a308a23928b143d.jpg" 
              alt="Plan A Auto Spa Logo" 
              className="h-12 mr-3"
            />
            <div>
              <h1 className="text-xl font-bold">PLAN A AUTO SPA</h1>
              <p className="text-sm">MOBILE DETAILING</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a href="#services" className="hover:text-blue-200 transition-colors">Services</a>
            <a href="#maintenance" className="hover:text-blue-200 transition-colors">Maintenance</a>
            <a href="#about" className="hover:text-blue-200 transition-colors">About Us</a>
            <a href="#contact" className="hover:text-blue-200 transition-colors">Contact</a>
            <Button onClick={() => setBookingOpen(true)} className="bg-white text-primary hover:bg-blue-100">
              Book Now
            </Button>
          </nav>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>
      
      {/* Mobile Menu */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="sm:max-w-md p-0 h-full sm:h-auto">
          <div className="bg-primary text-white p-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="p-6 flex flex-col space-y-4">
            <a 
              href="#services" 
              className="text-lg py-2 border-b border-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </a>
            <a 
              href="#maintenance" 
              className="text-lg py-2 border-b border-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Maintenance
            </a>
            <a 
              href="#about" 
              className="text-lg py-2 border-b border-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a 
              href="#contact" 
              className="text-lg py-2 border-b border-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
            <Button 
              className="mt-4 w-full" 
              onClick={() => {
                setMobileMenuOpen(false);
                setBookingOpen(true);
              }}
            >
              Book Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-16 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Professional Mobile Car Detailing
            </motion.h1>
            <motion.p 
              className="text-xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              We bring the car wash to you. Premium detailing services at your home or office.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-blue-100"
                onClick={() => setBookingOpen(true)}
              >
                Book Your Detail
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 md:opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1000&auto=format&fit=crop" 
            alt="Car being detailed" 
            className="w-full h-full object-cover"
          />
        </div>
      </section>
      
      {/* Wave Divider */}
      <div className="wave-divider"></div>
      
      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Detailing Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our range of professional detailing packages designed to keep your vehicle looking its best.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.id}
                className="service-card bg-white rounded-lg shadow-lg overflow-hidden"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-2">#{service.id} {service.name}</h3>
                  <p className="text-yellow-500 font-semibold mb-4">{service.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-700 mb-2">Pricing:</h4>
                    <ul className="space-y-1">
                      <li>${service.pricing.small} Small</li>
                      <li>${service.pricing.medium} Medium</li>
                      <li>${service.pricing.large} Large</li>
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-700 mb-2">Includes:</h4>
                    {service.includes.exterior && (
                      <div className="mb-2">
                        <p className="font-semibold">Exterior Process:</p>
                        <ul className="space-y-1">
                          {service.includes.exterior.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="checkmark">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {service.includes.interior && (
                      <div>
                        <p className="font-semibold">Interior Process:</p>
                        <ul className="space-y-1">
                          {service.includes.interior.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="checkmark">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {service.note && (
                    <p className="text-yellow-600 italic mb-4">{service.note}</p>
                  )}
                  
                  <Button 
                    className="w-full"
                    onClick={() => handleBookNow(service)}
                  >
                    Book This Package
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Maintenance Programs */}
      <section id="maintenance" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Maintenance Programs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Keep your ride looking fresh with our regular maintenance programs.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-primary mb-4">
                  <span className="text-yellow-500">★</span> Keep Your Ride Looking Fresh <span className="text-yellow-500">★</span>
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {maintenancePrograms.map((program) => (
                    <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                      <h4 className="text-xl font-bold text-primary mb-2">{program.name}</h4>
                      {program.description && (
                        <p className="text-gray-600 mb-2">{program.description}</p>
                      )}
                      <p className="text-lg font-bold">{program.price}</p>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full md:w-auto"
                  onClick={() => setBookingOpen(true)}
                >
                  Sign Up For Maintenance
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">About Plan A Auto Spa</h2>
              <p className="text-gray-600">
                Your trusted partner for premium mobile car detailing services.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold text-primary mb-4">Why Choose Us?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="checkmark text-xl">✓</span>
                    <span>We come to your location - home or office</span>
                  </li>
                  <li className="flex items-start">
                    <span className="checkmark text-xl">✓</span>
                    <span>Professional-grade products and equipment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="checkmark text-xl">✓</span>
                    <span>Experienced and detail-oriented technicians</span>
                  </li>
                  <li className="flex items-start">
                    <span className="checkmark text-xl">✓</span>
                    <span>Flexible scheduling to fit your busy life</span>
                  </li>
                  <li className="flex items-start">
                    <span className="checkmark text-xl">✓</span>
                    <span>Satisfaction guaranteed on every service</span>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1635260409896-f8e5c5d10a4e?q=80&w=1974&auto=format&fit=crop" 
                  alt="Mobile car detailing service" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Contact Us</h2>
              <p className="text-gray-600">
                Have questions? Get in touch with our team.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-4">Reach Out</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <p className="font-semibold">Phone</p>
                          <p className="text-gray-600">(626) 224-6127</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <p className="font-semibold">Service Area</p>
                          <p className="text-gray-600">Greater San Dimas</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <p className="font-semibold">Hours</p>
                          <p className="text-gray-600">Monday - Saturday: 9AM - 6PM</p>
                          <p className="text-gray-600">Sunday: By appointment only</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-4">Quick Message</h3>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Your email" />
                      </div>
                      
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <textarea 
                          id="message" 
                          className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                          placeholder="How can we help you?"
                        ></textarea>
                      </div>
                      
                      <Button className="w-full">Send Message</Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/efc9cf05-dae7-4dfe-a9b2-fa36965cab51/182d8f5d2eafcb105a308a23928b143d.jpg" 
                alt="Plan A Auto Spa Logo" 
                className="h-10 mr-3"
              />
              <div>
                <h3 className="font-bold">PLAN A AUTO SPA</h3>
                <p className="text-sm">MOBILE DETAILING</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm mb-2">© 2023 Plan A Auto Spa. All rights reserved.</p>
              <div className="flex space-x-4 justify-center md:justify-end">
                <a href="#" className="hover:text-blue-200 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-200 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="bg-primary text-white p-6">
            <DialogTitle className="text-2xl font-bold">Book Your Detailing Service</DialogTitle>
            <DialogDescription className="text-blue-100">
              Fill out the form below to schedule your appointment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <form onSubmit={handleSubmitBooking}>
              <Tabs defaultValue="service" className="mb-6">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="service">Service</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="confirm">Confirm</TabsTrigger>
                </TabsList>
                
                <TabsContent value="service" className="space-y-4">
                  <div>
                    <Label htmlFor="service-select">Select Service</Label>
                    <Select 
                      value={selectedService ? selectedService.id.toString() : ""} 
                      onValueChange={(value) => {
                        const service = services.find(s => s.id === parseInt(value));
                        setSelectedService(service);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicle-size">Vehicle Size</Label>
                    <Select 
                      value={vehicleSize} 
                      onValueChange={setVehicleSize}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (Sedan, Coupe)</SelectItem>
                        <SelectItem value="medium">Medium (SUV, Crossover)</SelectItem>
                        <SelectItem value="large">Large (Truck, Large SUV)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedService && vehicleSize && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="font-semibold">Selected Package: {selectedService.name}</p>
                      <p className="text-lg font-bold text-primary">Price: ${calculatePrice()}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button type="button" onClick={() => document.querySelector('[data-value="details"]').click()}>
                      Next
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="booking-date">Select Date</Label>
                      <DatePicker 
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="booking-time">Select Time</Label>
                      <Select 
                        value={selectedTime} 
                        onValueChange={setSelectedTime}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="Your email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Service Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      placeholder="Where should we meet you?"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.querySelector('[data-value="service"]').click()}
                    >
                      Back
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => document.querySelector('[data-value="confirm"]').click()}
                    >
                      Next
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="confirm" className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle-info">Vehicle Information</Label>
                    <Input 
                      id="vehicle-info" 
                      name="vehicleInfo" 
                      value={formData.vehicleInfo} 
                      onChange={handleInputChange} 
                      placeholder="Year, Make, Model, Color"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="special-requests">Special Requests</Label>
                    <textarea 
                      id="special-requests" 
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                      placeholder="Any special instructions or requests?"
                    ></textarea>
                  </div>
                  
                  {selectedService && vehicleSize && selectedDate && selectedTime && (
                    <div className="bg-blue-50 p-4 rounded-md space-y-2">
                      <h4 className="font-bold text-primary">Booking Summary</h4>
                      <p><span className="font-semibold">Service:</span> {selectedService.name}</p>
                      <p><span className="font-semibold">Vehicle Size:</span> {vehicleSize.charAt(0).toUpperCase() + vehicleSize.slice(1)}</p>
                      <p><span className="font-semibold">Price:</span> ${calculatePrice()}</p>
                      <p><span className="font-semibold">Date:</span> {selectedDate?.toLocaleDateString()}</p>
                      <p><span className="font-semibold">Time:</span> {selectedTime}</p>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-2 mt-4">
                    <Checkbox 
                      id="terms" 
                      checked={agreeToTerms}
                      onCheckedChange={setAgreeToTerms}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions and understand that cancellations must be made at least 24 hours in advance.
                    </label>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.querySelector('[data-value="details"]').click()}
                    >
                      Back
                    </Button>
                    <Button type="submit">
                      Confirm Booking
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;