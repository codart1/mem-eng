import { describe, it, expect } from "vitest";
import { selectRemoteToApply, selectLocalToPush } from "./engine";

describe("selectRemoteToApply (last-write-wins, pull side)", () => {
  const local = new Map<string, { updatedAt: number }>([
    ["a", { updatedAt: 100 }],
    ["b", { updatedAt: 200 }],
  ]);

  it("applies remote records we don't have locally", () => {
    const remote = [{ id: "c", updated_at: 50 }];
    expect(selectRemoteToApply(remote, local).map((r) => r.id)).toEqual(["c"]);
  });

  it("applies remote records that are strictly newer than local", () => {
    const remote = [{ id: "a", updated_at: 150 }];
    expect(selectRemoteToApply(remote, local).map((r) => r.id)).toEqual(["a"]);
  });

  it("skips remote records older than local (local wins)", () => {
    const remote = [{ id: "b", updated_at: 199 }];
    expect(selectRemoteToApply(remote, local)).toEqual([]);
  });

  it("skips remote records with an equal timestamp (treated as identical)", () => {
    const remote = [{ id: "a", updated_at: 100 }];
    expect(selectRemoteToApply(remote, local)).toEqual([]);
  });

  it("handles a mixed batch", () => {
    const remote = [
      { id: "a", updated_at: 90 }, // older — skip
      { id: "b", updated_at: 250 }, // newer — apply
      { id: "d", updated_at: 10 }, // new — apply
    ];
    expect(selectRemoteToApply(remote, local).map((r) => r.id).sort()).toEqual([
      "b",
      "d",
    ]);
  });
});

describe("selectLocalToPush (high-water mark, push side)", () => {
  const local = [
    { id: "a", updatedAt: 100 },
    { id: "b", updatedAt: 200 },
    { id: "c", updatedAt: 300 },
  ];

  it("pushes only rows changed after the high-water mark", () => {
    expect(selectLocalToPush(local, 150).map((r) => r.id)).toEqual(["b", "c"]);
  });

  it("pushes nothing when everything is already synced", () => {
    expect(selectLocalToPush(local, 300)).toEqual([]);
  });

  it("pushes everything on a first sync (mark = 0)", () => {
    expect(selectLocalToPush(local, 0).map((r) => r.id)).toEqual(["a", "b", "c"]);
  });
});
