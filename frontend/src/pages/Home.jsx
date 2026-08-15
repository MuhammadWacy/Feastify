import Hero from "../components/home/Hero";
import HowItWorks from "../components/home/HowItWorks";
import Features from "../components/home/Features";
import UserRoles from "../components/home/UserRoles";
import CallToAction from "../components/home/CallToAction";

function Home() {
    return (
        <>
            <Hero />
            <HowItWorks />
            <Features />
            <UserRoles />
            <CallToAction />
        </>
    );
}

export default Home;