import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export function PortfolioUploadFields() {
	return (
		<>
			<label className="text-sm text-neutral-700">
				Title
				<Input required name="title" maxLength={150} className="mt-1" />
			</label>
			<label className="text-sm text-neutral-700">
				Image
				<Input
					required
					type="file"
					name="file"
					accept={ACCEPTED_IMAGE_TYPES}
					className="mt-1"
				/>
			</label>
			<label className="text-sm text-neutral-700 sm:col-span-2">
				Details
				<Textarea name="details" rows={2} maxLength={5000} className="mt-1" />
			</label>
		</>
	);
}
