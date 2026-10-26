"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { SelectField } from "@/components/ui/SelectField";
import { formatPeso } from "@/lib/format";
import { uniqueSorted } from "@/lib/inventory";
import { BODY_TYPE_LABELS, BODY_TYPES, type BodyType, type Car } from "@/lib/types";

export type SearchCar = Pick<Car, "body_type" | "make" | "model" | "price_php">;

const PRICE_CAPS = [500_000, 750_000, 1_000_000, 1_500_000, 2_000_000];

/**
 * One search form for the whole home page (the original repeated it in 3 slides).
 * Each dropdown only offers choices that still have cars, so a search can't dead-end.
 */
export function HeroSearch({ cars }: { cars: SearchCar[] }) {
  const router = useRouter();
  const [body, setBody] = useState<BodyType | "">("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [maxChoice, setMax] = useState("");

  const byBody = cars.filter((car) => !body || car.body_type === body);
  const byMake = byBody.filter((car) => !make || car.make === make);
  const byModel = byMake.filter((car) => !model || car.model === model);

  const bodyOptions = BODY_TYPES.filter((type) => cars.some((car) => car.body_type === type));
  const makeOptions = uniqueSorted(byBody.map((car) => car.make));
  const modelOptions = make ? uniqueSorted(byMake.map((car) => car.model)) : [];
  const cheapest = Math.min(...byModel.map((car) => car.price_php));
  const priceOptions = PRICE_CAPS.filter((cap) => cap >= cheapest);
  // A price cap can stop making sense after a filter change; fall back to "Any price".
  const max = priceOptions.includes(Number(maxChoice)) ? maxChoice : "";
  const matches = byModel.filter((car) => !max || car.price_php <= Number(max));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (body) params.set("body", body);
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (max) params.set("max", max);
    const query = params.toString();
    router.push(query ? `/inventory?${query}` : "/inventory");
  }

  return (
    <form
      action="/inventory"
      method="get"
      onSubmit={onSubmit}
      role="search"
      aria-label="Find a car"
      className="grid gap-2 rounded-card bg-soft p-2 sm:grid-cols-2"
    >
      <SelectField
        label="Body type"
        name="body"
        value={body}
        onChange={(value) => {
          setBody(value as BodyType | "");
          setMake("");
          setModel("");
        }}
      >
        <option value="">Any body type</option>
        {bodyOptions.map((type) => (
          <option key={type} value={type}>
            {BODY_TYPE_LABELS[type]}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Make"
        name="make"
        value={make}
        onChange={(value) => {
          setMake(value);
          setModel("");
        }}
      >
        <option value="">Any make</option>
        {makeOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </SelectField>

      <SelectField
        label="Model"
        name="model"
        value={model}
        onChange={setModel}
        disabled={!make}
      >
        <option value="">{make ? `Any ${make} model` : "Choose a make first"}</option>
        {modelOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </SelectField>

      <SelectField label="Max price" name="max" value={max} onChange={setMax}>
        <option value="">Any price</option>
        {priceOptions.map((cap) => (
          <option key={cap} value={cap}>
            Up to {formatPeso(cap)}
          </option>
        ))}
      </SelectField>

      <button
        type="submit"
        disabled={matches.length === 0}
        className="flex min-h-14 items-center justify-center gap-2 rounded-field bg-signal px-6 font-semibold text-white transition-colors hover:bg-signal-dark disabled:cursor-not-allowed disabled:bg-muted sm:col-span-2"
      >
        <Search aria-hidden size={18} />
        <span aria-live="polite" className="tabular-nums">
          {matches.length === 0
            ? "No cars match"
            : `Show ${matches.length} ${matches.length === 1 ? "car" : "cars"}`}
        </span>
      </button>
    </form>
  );
}
