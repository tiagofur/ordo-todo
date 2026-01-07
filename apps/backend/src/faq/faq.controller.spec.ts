import { Test, TestingModule } from "@nestjs/testing";
import { FAQController } from "./faq.controller";
import { FAQService } from "./faq.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateFAQDto } from "./dto/create-faq.dto";
import { UpdateFAQDto } from "./dto/update-faq.dto";

describe("FAQController", () => {
    let controller: FAQController;
    let service: jest.Mocked<FAQService>;

    beforeEach(async () => {
        const mockService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getCategories: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [FAQController],
            providers: [
                { provide: FAQService, useValue: mockService },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<FAQController>(FAQController);
        service = module.get<FAQService>(FAQService) as jest.Mocked<FAQService>;
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("create", () => {
        it("should create a new FAQ", async () => {
            const dto: CreateFAQDto = {
                question: "What is Ordo?",
                answer: "Ordo is a productivity tool.",
                category: "General",
                order: 0,
            };
            service.create.mockResolvedValue({ id: "1", ...dto } as any);

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toHaveProperty("id", "1");
        });
    });

    describe("findAll", () => {
        it("should return all FAQs", async () => {
            const faqs = [{ id: "1", question: "Q1" }];
            service.findAll.mockResolvedValue(faqs as any);

            const result = await controller.findAll("General", "true");

            expect(service.findAll).toHaveBeenCalledWith({
                category: "General",
                publishedOnly: true,
            });
            expect(result).toEqual(faqs);
        });
    });

    describe("findOne", () => {
        it("should return a single FAQ", async () => {
            const faq = { id: "1", question: "Q1" };
            service.findOne.mockResolvedValue(faq as any);

            const result = await controller.findOne("1");

            expect(service.findOne).toHaveBeenCalledWith("1");
            expect(result).toEqual(faq);
        });
    });

    describe("update", () => {
        it("should update an FAQ", async () => {
            const dto: UpdateFAQDto = { question: "Updated?" };
            service.update.mockResolvedValue({ id: "1", ...dto } as any);

            const result = await controller.update("1", dto);

            expect(service.update).toHaveBeenCalledWith("1", dto);
            expect(result).toHaveProperty("question", "Updated?");
        });
    });

    describe("remove", () => {
        it("should remove an FAQ", async () => {
            service.remove.mockResolvedValue({ success: true } as any);

            const result = await controller.remove("1");

            expect(service.remove).toHaveBeenCalledWith("1");
            expect(result).toEqual({ success: true });
        });
    });
});
