export const WIDTH_DETAILS_18650 = {
	width_inner: 1.65,
	width_inbetween: 0.27,
	width_outter: 0.225,
	height: 6.5,
};

export const WIDTH_DETAILS_21700 = {
	width_inner: 1.9,
	width_inbetween: 0.39,
	width_outter: 0.25,
	height: 7.0,
};

type Battery = {
	value: number;
	label: string;
	title: string;
	subTitle: string;
	meshPath: string;
	mah: number;
	dischargeRate: number;
	voltage: number;
	cellWidth: number;
	cellHeight: number;
	cellLength: number;
	cellWeight: number;
	peakDischargeRate: number;
	skuTag?: string;
};

export const values: Battery[] = [
	{
		value: 0,
		label: 'BAK N18650COP 2500mAh - 30A',
		title: 'BAK N18650COP',
		subTitle: '2500mAh - 30A',
		meshPath: '/batteries/mesh/N18650COP 2500MAH.glb',
		mah: 2500,
		dischargeRate: 30,
		peakDischargeRate: 45,
		voltage: 3.6,
		cellWidth: 18.4,
		cellHeight: 65.0,
		cellLength: 18.4,
		cellWeight: 47.0,
		skuTag: 'BAK-2500',
	},
	{
		value: 1,
		label: 'Molicel INR21700-P42A 4200mAh - 45A',
		title: 'Molicel INR21700-P42A',
		subTitle: '4200mAh - 45A',
		meshPath: '/batteries/mesh/INR21700-P42A 4200MAH.glb',
		mah: 4200,
		dischargeRate: 45,
		peakDischargeRate: 55,
		voltage: 3.6,
		cellWidth: 21.4,
		cellHeight: 70.15,
		cellLength: 21.4,
		cellWeight: 70.0,
		skuTag: 'Molicel-4200',
	},
	{
		value: 2,
		label: 'Molicel INR21700-P45B 4500mAh - 45A',
		title: 'Molicel INR21700-P45B',
		subTitle: '4500mAh - 45A',
		meshPath: '/batteries/mesh/INR21700-P45B 4500MAH.glb',
		mah: 4500,
		dischargeRate: 45,
		peakDischargeRate: 55,
		voltage: 3.6,
		cellWidth: 21.4,
		cellHeight: 70.0,
		cellLength: 21.4,
		cellWeight: 70.0,
		skuTag: 'Molicel-4500',
	},
	{
		value: 3,
		label: 'INR21700-M50LT 4930mAh - 14.4A',
		title: 'INR21700-M50LT',
		subTitle: '4930mAh - 14.4A',
		meshPath: '/batteries/mesh/INR21700-M50LT 4930MAH.glb',
		mah: 4930,
		dischargeRate: 14.4,
		peakDischargeRate: 20,
		voltage: 3.6,
		cellWidth: 21.4,
		cellHeight: 70.0,
		cellLength: 21.4,
		cellWeight: 69.0,
		skuTag: 'INR21700-M50LT',
	},
	{
		value: 4,
		label: 'INR18650 Samsung 35E 3400mAh - 8A',
		title: 'INR18650 Samsung 35E',
		subTitle: '3400mAh - 8A',
		meshPath: '/batteries/mesh/INR18650 35E 3400MAH.glb',
		mah: 3400,
		dischargeRate: 8,
		peakDischargeRate: 15,
		voltage: 3.6,
		cellWidth: 18.4,
		cellHeight: 65.0,
		cellLength: 18.4,
		cellWeight: 50.0,
		skuTag: 'INR18650-35E',
	},
	{
		value: 5,
		label: 'INR18650MH1 3200mAh - 6A',
		title: 'INR18650MH1',
		subTitle: '3200mAh - 6A',
		meshPath: '/batteries/mesh/INR18650MH1 3200MAH.glb',
		mah: 3200,
		dischargeRate: 6,
		peakDischargeRate: 12,
		voltage: 3.6,
		cellWidth: 18.4,
		cellHeight: 65.0,
		cellLength: 18.4,
		cellWeight: 45.0,
		skuTag: 'INR18650MH1',
	},
	{
		value: 6,
		label: 'Molicel INR18650-P28A 2800mAh - 35A',
		title: 'Molicel INR18650-P28A',
		subTitle: '2800mAh - 35A',
		meshPath: '/batteries/mesh/INR18650-P28A 2800MAH.glb',
		mah: 2800,
		dischargeRate: 35,
		peakDischargeRate: 45,
		voltage: 3.6,
		cellWidth: 18.4,
		cellHeight: 65.0,
		cellLength: 18.4,
		cellWeight: 48.0,
		skuTag: 'Molicel-2800',
	},
	{
		value: 7,
		label: 'Sony/Murata US18650VTC5C 2600mAh - 30A',
		title: 'Sony/Murata US18650VTC5C',
		subTitle: '2600mAh - 30A',
		meshPath: '/batteries/mesh/US18650VTC5C.glb',
		mah: 2600,
		dischargeRate: 30,
		peakDischargeRate: 45,
		voltage: 3.6,
		cellWidth: 18.4,
		cellHeight: 65.0,
		cellLength: 18.4,
		cellWeight: 46.0,
		skuTag: 'US18650VTC5C',
	},
];
export const batteryRawHeightUnitsToCm = (unit: number, type: string) => {
	switch (type) {
		case '18650':
			return unit * WIDTH_DETAILS_18650.height;
		case '21700':
			return unit * WIDTH_DETAILS_21700.height;
	}
	return unit * WIDTH_DETAILS_18650.height;
};

export const getBatteryType = (activeBattery: number) => {
	const label = values[activeBattery].label;

	const is18650 = label.includes('18650');
	let type = '18650' as '18650' | '21700';
	if (is18650) {
		type = '18650';
	} else {
		type = '21700';
	}
	return type;
};
export const batteryCmToRawHeightUnits = (
	cm: number,
	type: '18650' | '21700'
) => {
	switch (type) {
		case '18650':
			return cm / WIDTH_DETAILS_18650.height;
		case '21700':
			return cm / WIDTH_DETAILS_21700.height;
	}
	return cm / WIDTH_DETAILS_18650.height;
};

export const batteryRawUnitsToCm = (unit: number, type: string) => {
	let A = 0;
	let B = 0;
	let C = 0;
	switch (type) {
		case '18650':
			A = WIDTH_DETAILS_18650.width_inner;
			B = WIDTH_DETAILS_18650.width_inbetween;
			C = WIDTH_DETAILS_18650.width_outter;
			break;
		case '21700':
			A = WIDTH_DETAILS_21700.width_inner;
			B = WIDTH_DETAILS_21700.width_inbetween;
			C = WIDTH_DETAILS_21700.width_outter;
			break;
	}
	const result = unit * A + (unit - 1) * B + 2 * C;

	return result;
};

export const batteryCmToRawUnits = (cm: number, type: '18650' | '21700') => {
	let A = 0;
	let B = 0;
	let C = 0;
	switch (type) {
		case '18650':
			A = WIDTH_DETAILS_18650.width_inner;
			B = WIDTH_DETAILS_18650.width_inbetween;
			C = WIDTH_DETAILS_18650.width_outter;
			break;
		case '21700':
			A = WIDTH_DETAILS_21700.width_inner;
			B = WIDTH_DETAILS_21700.width_inbetween;
			C = WIDTH_DETAILS_21700.width_outter;
			break;
	}

	const rawValue = (cm - 2 * C) / (A + B);

	return rawValue;

	// return Math.floor((cm - 2 * C)  / (A + B));
	//get me the upper floor
	// return Math.ceil((cm - 2 * C) / (A + B));
};
export const batteryHeader = {
	voltajul: 'Voltajul',
	ah: 'Capacitate',
	kwh: 'kWh',
	dischargeRate: 'Descarcare continua',
	nrDeCelule: 'Nr. celule',
	series: 'Serii',
	parallel: 'Paralel',
	weight: 'Greutate',
	dischargePeak: 'Descarcare varf',
	latime: 'Latime',
	lungime: 'Lungime',
	inaltime: 'Inaltime',
};

export type BatteryDetails = {
	voltajul: string;
	ah: string;
	kwh: string;
	dischargeRate: string;
	nrDeCelule: string;
	cellVoltage: string;
	series: string;
	parallel: string;
	weight: string;
	dischargePeak: string;
	latime: string;
	// lungime: string;
	lungime: string;
	inaltime: string;
};

const getActiveBattery = (activeBattery: number) => {
	return values[activeBattery];
};

//@ts-ignore
const buildBatteryDimensions = (batteryPackMatrix, batteryType) => {
	const countInvisibleBatteries = batteryPackMatrix
		.flat()
		.filter((cell: any) => cell === '.').length;
	const heightLen = batteryPackMatrix.length;
	const rowLen = batteryPackMatrix[0].length;
	const colLen = batteryPackMatrix[0][0].length;

	const diff = Math.floor(countInvisibleBatteries / colLen);
	const rowLenToCm = batteryRawUnitsToCm(
		rowLen > 1 ? rowLen : rowLen - diff,
		batteryType
	);
	const colLenToCm = batteryRawUnitsToCm(colLen, batteryType);
	const heightLenToCm = batteryRawHeightUnitsToCm(heightLen, batteryType);
	return {
		latime: `${colLenToCm.toFixed(3)} cm`,
		lungime: `${rowLenToCm.toFixed(3)} cm`,
		inaltime: `${heightLenToCm.toFixed(3)} cm`,
	};
};

const getNumberOfCells = (batteryLayout: any) => {
	//filter the values that have .
	let cells = 0;
	//battery layout is an array of arrays
	batteryLayout.forEach((row: any) => {
		row.forEach((col: any) => {
			col.forEach((cell: any) => {
				if (cell !== '.') {
					cells++;
				}
			});
		});
	});
	return cells;
};

export type InfoGraph = {
	activeBattery: number;
	batteryLayout: any;
	series: number;
	batteryVoltage: number;
};
export const buildInfoGraph = (data: InfoGraph, raw = false) => {
	const { activeBattery, batteryLayout, series, batteryVoltage } = data;
	const activeBat = getActiveBattery(activeBattery);
	const cellCapacityAh = activeBat.mah / 1000; // Convert mAh to Ah
	const cellWeight = activeBat.cellWeight;
	const totalCells = getNumberOfCells(batteryLayout); // Count of active cells
	const parallel = Math.floor(totalCells / series); // Cells per series (Ah increases)
	const capacityAh = parallel * cellCapacityAh; // Total Ah
	const energyKWh = (batteryVoltage * capacityAh) / 1000; // Convert Wh to kWh
	const dischargeRate = activeBat.dischargeRate * parallel; // Total discharge rate
	const weight = totalCells * cellWeight; // Total weight
	const cellDischargePeak = activeBat.peakDischargeRate * parallel; // Discharge rate per cell
	const batteryType = getBatteryType(activeBattery);
	const gramsOrKg = (weight: number) => {
		if (weight > 1000) {
			return `${(weight / 1000).toFixed(2)} kg`;
		}
		return `${weight.toFixed(3)} g`;
	};

	const { latime, lungime, inaltime } = buildBatteryDimensions(
		batteryLayout,
		batteryType
	);
	if (raw === false)
		return {
			voltajul: `${batteryVoltage.toFixed(2)}V`,
			ah: `${capacityAh.toFixed(2)}Ah`,
			kwh: `${energyKWh.toFixed(3)}kWh`,
			dischargeRate: `${dischargeRate.toFixed(3)} A`,
			nrDeCelule: `${totalCells}`,
			series: `${series}`,
			parallel: `${parallel}`,
			weight: '~ ' + gramsOrKg(weight),
			dischargePeak: `${cellDischargePeak} A`,
			lungime: lungime,
			latime: latime,
			inaltime: inaltime,
		};
	else {
		return {
			voltajul: batteryVoltage,
			ah: capacityAh,
			kwh: energyKWh,
			dischargeRate: dischargeRate,
			nrDeCelule: totalCells,
			series: series,
			parallel: parallel,
			weight: weight,
			dischargePeak: cellDischargePeak,
			lungime: lungime,
			latime: latime,
			inaltime: inaltime,
		};
	}
};
