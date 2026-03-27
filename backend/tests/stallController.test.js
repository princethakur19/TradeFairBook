const test = require("node:test");
const assert = require("node:assert/strict");

const controllerPath = require.resolve("../controllers/stallController");
const stallModelPath = require.resolve("../models/Stall");

const loadController = (stallMock) => {
  delete require.cache[controllerPath];
  require.cache[stallModelPath] = {
    id: stallModelPath,
    filename: stallModelPath,
    loaded: true,
    exports: stallMock
  };

  return require(controllerPath);
};

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  }
});

test("createStalls returns 201 and inserted stall count", async () => {
  const payload = [{ stallNumber: "A-1" }, { stallNumber: "A-2" }];
  const controller = loadController({
    async insertMany(items, options) {
      assert.deepEqual(items, payload);
      assert.deepEqual(options, { ordered: false });
      return items;
    }
  });

  const req = { body: payload };
  const res = createResponse();

  await controller.createStalls(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.count, 2);
  assert.deepEqual(res.body.data, payload);
});

test("createStalls returns 400 on duplicate key error", async () => {
  const controller = loadController({
    async insertMany() {
      const error = new Error("duplicate key");
      error.code = 11000;
      throw error;
    }
  });

  const res = createResponse();
  await controller.createStalls({ body: [{ stallNumber: "A-1" }] }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Some stalls already exist in this dome.");
});

test("getAllStalls returns populated stall list", async () => {
  const stalls = [{ stallNumber: "B-1" }, { stallNumber: "B-2" }];
  const controller = loadController({
    find() {
      return {
        populate(path, selection) {
          assert.equal(path, "dome");
          assert.equal(selection, "domeName location");
          return Promise.resolve(stalls);
        }
      };
    }
  });

  const res = createResponse();
  await controller.getAllStalls({}, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 2);
  assert.deepEqual(res.body.data, stalls);
});

test("getStallsByDome filters by dome and sorts oldest to newest", async () => {
  const stalls = [{ stallNumber: "C-1" }];
  const controller = loadController({
    find(query) {
      assert.deepEqual(query, { dome: "dome-123" });
      return {
        populate(path, selection) {
          assert.equal(path, "dome");
          assert.equal(selection, "name");
          return {
            sort(sortOrder) {
              assert.deepEqual(sortOrder, { createdAt: 1 });
              return Promise.resolve(stalls);
            }
          };
        }
      };
    }
  });

  const res = createResponse();
  await controller.getStallsByDome({ params: { domeId: "dome-123" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 1);
  assert.deepEqual(res.body.data, stalls);
});

test("updateStall only persists price and status fields", async () => {
  let capturedUpdate = null;
  const updatedStall = { _id: "stall-1", price: 9000, status: "BOOKED" };
  const controller = loadController({
    async findByIdAndUpdate(id, update, options) {
      assert.equal(id, "stall-1");
      capturedUpdate = update;
      assert.deepEqual(options, { new: true, runValidators: true });
      return updatedStall;
    }
  });

  const req = {
    params: { id: "stall-1" },
    body: { price: 9000, status: "BOOKED", stallNumber: "IGNORED" }
  };
  const res = createResponse();

  await controller.updateStall(req, res);

  assert.deepEqual(capturedUpdate, { price: 9000, status: "BOOKED" });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Stall updated successfully");
  assert.deepEqual(res.body.data, updatedStall);
});

test("updateStall returns 404 when stall does not exist", async () => {
  const controller = loadController({
    async findByIdAndUpdate() {
      return null;
    }
  });

  const res = createResponse();
  await controller.updateStall(
    { params: { id: "missing-stall" }, body: { price: 7500, status: "AVAILABLE" } },
    res
  );

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Stall not found");
});

test("deleteStall returns success message for an existing stall", async () => {
  const controller = loadController({
    async findByIdAndDelete(id) {
      assert.equal(id, "stall-2");
      return { _id: id };
    }
  });

  const res = createResponse();
  await controller.deleteStall({ params: { id: "stall-2" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Stall deleted successfully");
});

test("getStallById returns 404 when stall is not found", async () => {
  const controller = loadController({
    findById(id) {
      assert.equal(id, "stall-404");
      return {
        populate(path, selection) {
          assert.equal(path, "dome");
          assert.equal(selection, "domeName location");
          return Promise.resolve(null);
        }
      };
    }
  });

  const res = createResponse();
  await controller.getStallById({ params: { id: "stall-404" } }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Stall not found");
});
