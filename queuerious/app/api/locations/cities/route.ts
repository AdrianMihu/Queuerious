import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const country = searchParams.get("country");
    const query = searchParams.get("q") ?? "";

    if (!country) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }

    const username = process.env.GEONAMES_USERNAME;

    if (!username) {
      return NextResponse.json(
        { error: "GeoNames username is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://secure.geonames.org/searchJSON?country=${encodeURIComponent(
        country
      )}&name_startsWith=${encodeURIComponent(
        query
      )}&featureClass=P&cities=cities1000&maxRows=10&username=${encodeURIComponent(
        username
      )}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || data.status) {
      console.error("GeoNames error:", data);

      return NextResponse.json(
        { error: "Failed to fetch cities" },
        { status: 500 }
      );
    }

    const cities = (data.geonames ?? [])
      .map(
        (city: {
          geonameId: number;
          name: string;
          countryCode: string;
          adminName1?: string;
        }) => ({
          id: city.geonameId,
          name: city.adminName1
            ? `${city.name} — ${city.adminName1.replace(/ County$/, "")}`
            : city.name,
          countryCode: city.countryCode,
        })
      )
      .filter(
        (
          city: {
            id: number;
            name: string;
            countryCode: string;
          },
          index: number,
          array: {
            id: number;
            name: string;
            countryCode: string;
          }[]
        ) => array.findIndex((item) => item.name === city.name) === index
      );

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Cities API error:", error);

    return NextResponse.json(
      { error: "Failed to load cities" },
      { status: 500 }
    );
  }
}
