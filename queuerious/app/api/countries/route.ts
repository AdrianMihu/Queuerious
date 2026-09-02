import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://countries.dev/countries?fields=name,alpha2Code,flag&sort=name",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }

    const data: {
      name: string;
      alpha2Code: string;
      flag: string;
    }[] = await response.json();

    const countries = data.map((country) => ({
      code: country.alpha2Code,
      name: country.name,
      flag: country.flag,
    }));

    return NextResponse.json(countries);
  } catch (error) {
    console.error("Countries API error:", error);

    return NextResponse.json(
      { error: "Failed to load countries" },
      { status: 500 }
    );
  }
}